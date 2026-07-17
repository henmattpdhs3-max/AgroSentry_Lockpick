from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/recommendations")
async def recommendations():
    return [
        {
            "title": "Pantau kondisi daun",
            "body": "Periksa daun yang bergejala setiap hari selama 3–5 hari.",
        }
    ]

