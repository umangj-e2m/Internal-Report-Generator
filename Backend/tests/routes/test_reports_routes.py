import pytest

from app import app
from services.scraper.service import get_scraper
from tests.fixtures.sample_site import BASE, make_scraper


def _create(client, url: str = f"{BASE}/") -> dict:
    response = client.post("/api/reports", json={"url": url})
    assert response.status_code == 201, response.text
    return response.json()


def test_create_report_returns_pages_slug_and_share_url(client):
    report = _create(client)

    assert report["site_name"] == "Example Co"
    assert report["page_count"] == 5
    assert report["slug"].startswith("example-co-")
    assert report["share_url"] == f"http://frontend.test/r/{report['slug']}"
    assert [page["position"] for page in report["pages"]] == [1, 2, 3, 4, 5]
    assert report["pages"][0]["headings"][0] == {"level": 1, "text": "Welcome to Example Co"}


def test_create_report_rejects_malformed_url(client):
    response = client.post("/api/reports", json={"url": "not a url"})

    assert response.status_code == 422


def test_create_report_returns_422_when_site_cannot_be_read(client):
    app.dependency_overrides[get_scraper] = lambda: make_scraper(failing=(f"{BASE}/",))

    response = client.post("/api/reports", json={"url": f"{BASE}/"})

    assert response.status_code == 422
    assert "Could not read" in response.json()["detail"]


def test_list_reports_supports_pagination_and_search(client):
    first = _create(client)
    second = _create(client)

    page_one = client.get("/api/reports", params={"page": 1, "page_size": 1}).json()
    assert page_one["total"] == 2
    assert [item["slug"] for item in page_one["items"]] == [second["slug"]]
    assert "pages" not in page_one["items"][0]

    page_two = client.get("/api/reports", params={"page": 2, "page_size": 1}).json()
    assert [item["slug"] for item in page_two["items"]] == [first["slug"]]

    assert client.get("/api/reports", params={"search": "example"}).json()["total"] == 2
    assert client.get("/api/reports", params={"search": "nothing-matches"}).json()["total"] == 0


def test_get_report_by_slug(client):
    created = _create(client)

    response = client.get(f"/api/reports/{created['slug']}")

    assert response.status_code == 200
    assert response.json()["pages"] == created["pages"]


@pytest.mark.parametrize("suffix", ["", "/html", "/pdf", "/docx", "/slides", "/pptx"])
def test_unknown_slug_returns_404(client, suffix):
    response = client.get(f"/api/reports/does-not-exist{suffix}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Report 'does-not-exist' was not found."


def test_delete_report(client):
    created = _create(client)

    assert client.delete(f"/api/reports/{created['slug']}").status_code == 204
    assert client.get(f"/api/reports/{created['slug']}").status_code == 404
