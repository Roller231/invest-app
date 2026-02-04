from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+aiomysql://root:password@localhost:3306/invest_app"
    DATABASE_URL_SYNC: str | None = None
    SECRET_KEY: str = "super-secret-key-change-in-production"
    BOT_TOKEN: str = ""
    BOT_USERNAME: str = "ggcat_game_bot"
    ADMIN_TG_IDS: str = "414135760"

    def model_post_init(self, __context) -> None:
        if not self.DATABASE_URL_SYNC:
            if self.DATABASE_URL.startswith("mysql+aiomysql://"):
                self.DATABASE_URL_SYNC = self.DATABASE_URL.replace("mysql+aiomysql://", "mysql+pymysql://", 1)
            else:
                self.DATABASE_URL_SYNC = self.DATABASE_URL
    
    @property
    def admin_tg_ids_list(self) -> List[int]:
        return [int(x.strip()) for x in self.ADMIN_TG_IDS.split(",") if x.strip()]
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
