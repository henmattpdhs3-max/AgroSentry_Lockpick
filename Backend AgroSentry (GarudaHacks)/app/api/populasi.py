from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/regional-density")
async def regional_density(window_days: int = 7):
    return [
        {
            "districtId": "kab-tangerang",
            "districtName": "Kab. Tangerang",
            "observedCases": 8,
            "windowDays": window_days,
        },
        {
            "districtId": "kab-bogor",
            "districtName": "Kab. Bogor",
            "observedCases": 5,
            "windowDays": window_days,
        },
        {
            "districtId": "kota-bogor",
            "districtName": "Kota Bogor",
            "observedCases": 3,
            "windowDays": window_days,
        },
    ]