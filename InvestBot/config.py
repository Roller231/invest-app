from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    BOT_TOKEN: str = ""
    DATABASE_URL: str = "mysql+aiomysql://invest:investpass@mysql:3306/invest_app"
    DATABASE_URL_SYNC: str = "mysql+pymysql://invest:investpass@mysql:3306/invest_app"
    BOT_USERNAME: str = "miniappp_test12312_bot"
    WEBAPP_URL: str = "https://invest-app-psi.vercel.app/"
    ADMIN_TG_IDS: str = "1008871802"

    @property
    def admin_tg_ids_list(self) -> List[int]:
        return [int(x.strip()) for x in self.ADMIN_TG_IDS.split(",") if x.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
