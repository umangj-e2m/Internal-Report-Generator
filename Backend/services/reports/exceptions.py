class ReportNotFoundError(Exception):
    def __init__(self, slug: str):
        super().__init__(f"Report '{slug}' was not found.")
        self.slug = slug
