import json
import logging
import onnxruntime
import numpy as np
from PIL import Image
from io import BytesIO
from pathlib import Path
from typing import Dict, Union

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__) ## look out what name here really placed with or just let it be that way


class InferONNX():
    def __init__(self, model_path: Union[str, Path], labels: Union[str, Path]):
        self.model_path = Path(model_path)
        self.labels_path = Path(labels)
    
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model tak dapat ditemukan di {self.model_path}")
    
        try: 
            self.session = onnxruntime.InferenceSession(str(self.model_path), providers=["CPUExecutionProvider"])
            self.input_name = self.session.get_inputs()[0].name

            logger.info(f"Model berhasil diunggah dari {self.model_path}")
        except Exception as e:
            logger.error(f"Gagal mengunggah model: {e}")
            raise
            
        model_input = self.session.get_inputs()[0]
        self.inputmodel = model_input.name
        self.shapemodel = model_input.shape
    
        self.channels = (self.shapemodel[1] == 3)
        self.height = self.shapemodel[2] if self.channels else self.shapemodel[1]
        self.width = self.shapemodel[3] if self.channels else self.shapemodel[2]

        self.labels = self.load_labels()

    def load_labels(self) -> Dict[str, str]:
        try:
            with open(self.labels, "r") as f:
                labels_dict = json.load(f)
            logger.info(f"Label berhasil diunggah dari {self.labels}")
            return labels_dict
        except Exception as e:
            logger.error(f"Gagal mengunggah label: {e}")
            return {}

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        try:
            img = Image.open(BytesIO(image_bytes)).convert("RGB").resize((self.width, self.height))
            arr = np.array(img).astype(np.float32) / 255.0

            if self.channels:
                arr = arr.transpose(2, 0, 1) 

            return np.expand_dims(arr, axis=0)
        except Exception as e:
            logger.error(f"Gagal memproses gambar: {e}")
            raise ValueError("Data gambar tidak valid.")

    def predict(self, image_bytes: bytes) -> Dict[str, Union[str, float]]:
        """Inferensi dengan hasil berupa kelas paling dekat/tinggi."""
        input_tensor = self.preprocess(image_bytes)
        
        outputs = self.session.run(None, {self.input_name: input_tensor})
        
        probs = outputs[0][0]
        idx = np.argmax(probs)
        kepastian = float(probs[idx])
        
        label = self.labels.get(str(idx), f"Class {idx}")
        
        return {
            "diagnosis": label,
            "kepastian": round(kepastian, 4),
            "status": "berhasil"
        }

    def warmup(self):
        logger.info("Menginisialisasi model...")
        dummy_input = np.zeros(self.shapemodel, dtype=np.float32)
        self.session.run(None, {self.input_name: dummy_input})
