# AgroSentry 🌱
**Inoculate Our Baseline Sustenance**
*Built by Team Lockpick*

## 🚀 Overview
AgroSentry is an intelligent agricultural platform designed to help farmers quickly identify plant diseases and receive actionable, context-aware management guidelines. By combining advanced computer vision with Retrieval-Augmented Generation (RAG), AgroSentry not only detects what is wrong with your crops but explains *why* and tells you exactly *how* to fix it.

## ✨ Key Features

* **🔍 Precision Disease Detection:** Upload an image of a crop leaf to instantly classify its health status. Our model supports a wide variety of staple crops including Maize, Cassava, Rice, Potato, Bell Pepper, Banana, and Alfalfa.
* **🗺️ GRAD-CAM Explainability:** See exactly what the AI sees. We utilize GRAD-CAM (Gradient-weighted Class Activation Mapping) to generate heatmaps that highlight the specific symptomatic areas on the leaf, ensuring transparent and trustworthy diagnoses.
* **💬 Smart Agricultural Assistant (RAG):** Going beyond simple classification, AgroSentry features a chatbot powered by a vector database. It retrieves highly specific pest and disease management guidelines, offering targeted treatments, organic solutions, and general propagation tips based on the exact disease detected.

## 🛠️ Tech Stack

* **AI & Machine Learning:** Python, Computer Vision (Classification & GRAD-CAM).
* **Database & Vector Search:** Supabase (PostgreSQL + `pgvector`) for storing and semantic searching of `agriculture_guidelines`.
* **Backend:** [Insert your backend framework here, e.g., FastAPI, Flask, or Node.js]
* **Frontend:** [Insert your frontend framework here, e.g., React, Next.js, or Streamlit]

## ⚙️ Local Setup & Installation

### Prerequisites
* Python 3.x
* [Supabase CLI](https://supabase.com/docs/guides/cli) installed
* Docker Desktop (running)

### 1. Clone the Repository
```
git clone [https://github.com/your-username/AgroSentry.git](https://github.com/your-username/AgroSentry.git)
cd AgroSentry
```
### 2. Database Setup(Supabase)
```Login to Supabase CLI```
supabase login

```Link to the cloud project```
supabase link --project-ref <YOUR_PROJECT_ID>

```Pull the latest database schema (including the agriculture_guidelines table)```
supabase db pull

### 3. Environment Variable
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
# Add other keys (e.g., OpenAI/Gemini API key for RAG)

### 4. Run the Application
```Install dependencies```
pip install -r requirements.txt

```Run the backend/frontend server```
[Insert your run command here, e.g., python app.py or npm run dev]
