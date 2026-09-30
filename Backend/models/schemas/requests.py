from pydantic import BaseModel, HttpUrl


class CreateReportRequest(BaseModel):
    url: HttpUrl
