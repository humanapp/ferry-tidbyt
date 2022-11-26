load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")
load("math.star", "math")

BACKGROUND_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAAAXNSR0IArs4c6QAAAMlJREFUaENjTFp+7T/DCAaMWWtuIAUAIwMDA3J4DH8+Y9GGWyM7BVRtvfsfFs8jkWZs2nlvZKeArn0PR3YKmHTo0X8GhpGY+EEJn5GBcfbxpyM7Cyw6/Wxkp4BVF16CywAYgCSMkcNn3HTlNc4sgN4MQm8wDgd5xt03347sLHDo7vuRXQiefvRxZKeAS88+j+yGkGN2+8jOAqMBMJoCRrPAaBkwgocEGRhHC8HRQnC0EBwtBEcLwREcAqO1wGg1OFoNjlaDI7oaBAC/0FSQnGL1JQAAAABJRU5ErkJggg==")
FERRY_WEST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAANyaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIFBybyBUcmlhbCAzLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIyLTExLTIzVDIzOjE1OjMzLTA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Ci+1DLAAAAC8SURBVCgVY2DAAv4DARZhvEJMeGVJkGREVqu9jB/FJVejPqLIw9SCXMwIBDA+Bg1SgAzmzZz3H4RBAJkGsdE1w00FKdbR0UGRv3LlCsP8WfNRxNA5SelJYDNQDEJXRMgQmHqQYeDABrkmuaCbAR0npiWC1fZO6sVLgyTBLgIZVNOzhuH5k/tgDTBi7oRSgl4DqQW5iAWmCURLyijCuTBDZ71ph4vhYzBqa2tjxAA+Dbjk4IFNiYFXr15lBAD5bm1O4swGlwAAAABJRU5ErkJggg==")
FERRY_EAST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAAOgaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPlBpeGVsbWF0b3IgUHJvIFRyaWFsIDMuMS4xPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMjItMTEtMjNUMjM6MjE6NDMtMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgq47FoKAAAAr0lEQVQoFWNgIBH8BwJsWpiwCZIjxoiuCWQjIxCgi4P42sv4UVxzNeojVnVgvfNmzvsPwiCATMPYYAkogWwZ3ESQQmQJdHZiWiKDjo4OivCVK1cYYK4HG0TIEJhukGHoAGYQPLB7J/WC1eCiQYYkF3RjYJAvQRqJdhHMIGQXScooMrSUhIC9xwKSmPWmHVkeKzuRAeItkGZsgFFbWxtvIGPThE0M7DVKDLt69SrYDADKb19m8UJeXgAAAABJRU5ErkJggg==")
WAKE_WEST_ANIM = base64.decode("UklGRmYCAABXRUJQVlA4WAoAAAACAAAAHQAAAAAAQU5JTQYAAAD/////AABBTk1GiAAAAAAAAAAAAB0AAAAAABAnAABWUDggcAAAABAFAJ0BKh4AAQA+kT6aR6WjoqEwCACwEglnAFMHWA4P8UzGKBfkFu3bX+lzqueLgjwA/tK/dK5KgmB/mBe58v6jkwKmnP+DZzirCMrAgU7m5aCWJggrkGIdHrt1csl+UD/D6zm4EAOgvsjT205bQABBTk1GhgAAAAAAAAAAAB0AAAAAABAnAABWUDggbgAAABAFAJ0BKh4AAQA+kTyaSCWjoqEwCACwEgllAEP/igAxWL9utwD7AN7/R6YkN97b2AAA/vX/zA38NcqeYSLy7NWpx11EbXv//R6bIs6UKRw05l78KuociidRvnqUpHKUjk2lZR9M1j9tsHkeQAAAQU5NRowAAAAAAAAAAAAdAAAAAAAQJwAAVlA4IHQAAAAQBQCdASoeAAEAPpE+mkelo6KhMAgAsBIJZwBTA1EAxQL9VtzPa/0+OAPdrYIvKZgAAP77n6YP+3u8VV9f9oxbev/m28fBeQjv4tKkgO9INKWKx672Mw5sg/xcdkIv9mPt//gZyM93pCHYLKBA7iwAQcAAAEFOTUaIAAAAAAAAAAAAHQAAAAAAECcAAFZQOCBwAAAAUAQAnQEqHgABAD6RPJpIJaOioTAIALASCWUAUwNQAMUC/VZT/R6YkIJWQAD++p3zf/YA/kU3f/pzvxvXP5xTz1SmQRIzrIgFfCx85MkEOTawDn/aJpJ26mdcNe2d2O2FgYmPzwyTmdqgY3HsmWAAAA==")
WAKE_EAST_ANIM = base64.decode("UklGRj4CAABXRUJQVlA4WAoAAAACAAAAHQAAAAAAQU5JTQYAAAD/////AABBTk1GfAAAAAAAAAAAAB0AAAAAAOgDAABWUDggZAAAALAEAJ0BKh4AAQA+kT6aSCWjoqEwCACwEgllALsCmQf0m4Af27a/xk7H+kMkv0AA/rbsXTgNKYUpo5cjnLSXJpRDuKCOUqHDr7vHerk28mxT+v8f//jtvPBon7uvaSMfdchokABBTk1GgAAAAAAAAAAAAB0AAAAAAOgDAABWUDggaAAAAPAEAJ0BKh4AAQA+kTqYR6WjoqEwCACwEgllAEP/tv/dAC4AvwD8gJf/EmYmHkv/gAD+4p6KcOAcucW4dyuE10gG/ApvPt50OKmVvn3orS43e+Yfccm9h0JR/8/+1f9aD3/cFkZEAAAAQU5NRn4AAAAAAAAAAAAdAAAAAADoAwAAVlA4IGYAAADQBACdASoeAAEAPpEkoE0loSOiGACwEgljABOJVsBfsFwA/t32Ab3+JQxMOuT5AAD+tTiwupvXgJzEtdTikvNxCnHmer2S/BHGoFcCrh0DdN72YLuGKk8dgf8bpFVpbTJhCgAAAABBTk1GgAAAAAAAAAAAAB0AAAAAAOgDAABWUDggaAAAANAEAJ0BKh4AAQA+kTyYSCWjoqEwCACwEgllAJ0fwKQAtgH2A/sG1/iTMSkFMAQAAP6bMXcMn/KSt12BOt7E4H8WljYTOrdY/kwVqeSAHzjscm03cIkCJfnP1+1diSnAO87F1N8z2RAA")

FERRY_IMG_WIDTH = 18
FERRY_IMG_HEIGHT = 11
WAKE_ANIM_WIDTH = 30
WAKE_ANIM_HEIGHT = 1

FERRY_STATUS_API_LOCALHOST = "http://localhost:8082/api/status"
FERRY_STATUS_API_PRODUCTION = "https://ferry-tidbyt.humanappliance.io/api/status"
FERRY_STATUS_API = FERRY_STATUS_API_PRODUCTION


def renderStatus(status):
    if status["disposition"] == "docked-in-kingston":
        return render.Text("Docked", )
    if status["disposition"] == "traveling-to-kingston":
        return render.Text("Sailing")
    if status["disposition"] == "docked-in-edmonds":
        return render.Text("Docked")
    if status["disposition"] == "traveling-to-edmonds":
        return render.Text("Sailing")
    if status["disposition"] == "no-vessels-in-service":
        return render.Text("No vessel in service")
    return render.Text("")


def renderDetail(status):
    if status["disposition"] == "docked-in-kingston":
        if "stdMins" in status.keys():
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("")
    if status["disposition"] == "traveling-to-kingston":
        if "etaMins" in status.keys():
            return render.Text("eta %d mins" % status["etaMins"])
        else:
            return render.Text("")
    if status["disposition"] == "docked-in-edmonds":
        if "stdMins" in status.keys():
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("")
    if status["disposition"] == "traveling-to-edmonds":
        return render.Text("")
    if status["disposition"] == "no-vessels-in-service":
        return render.Text("")
    return render.Text("")


def renderFerryCore(status):
    sailing = status["disposition"].startswith("traveling")
    if status["disposition"].find("edmonds") >= 0:
        ferry = FERRY_EAST_IMG
    else:
        ferry = FERRY_WEST_IMG
    if sailing:
        return render.Stack(
            children=[
                render.Image(src=ferry),
                render.Padding(
                    pad=(FERRY_IMG_WIDTH - 3, FERRY_IMG_HEIGHT - 1, 0, 0),
                    child=render.Image(src=WAKE_WEST_ANIM)
                )
            ]
        )
    else:
        return render.Image(src=ferry)


def renderFerry(status):
    maxDist = 64 - FERRY_IMG_WIDTH
    if status["disposition"] == "docked-in-kingston":
        return render.Padding(
            pad=(0, 5, 0, 0),
            child=renderFerryCore(status)
        )
    if status["disposition"] == "traveling-to-kingston":
        leftPad = maxDist
        if "distPct" in status.keys():
            leftPad = math.floor(maxDist * status["distPct"])
            return render.Padding(
                pad=(leftPad, 5, 0, 0),
                child=renderFerryCore(status)
            )
    if status["disposition"] == "docked-in-edmonds":
        return render.Padding(
            pad=(maxDist, 5, 0, 0),
            child=renderFerryCore(status)
        )
    if status["disposition"] == "traveling-to-edmonds":
        leftPad = 0
        if "distPct" in status.keys():
            leftPad = math.floor(maxDist * status["distPct"])
            return render.Padding(
                pad=(leftPad, 5, 0, 0),
                child=renderFerryCore(status)
            )
    if status["disposition"] == "no-vessels-in-service":
        return render.Text("")
    return render.Text("")


def main(config):
    res = http.get(FERRY_STATUS_API)
    status = res.json()
    # status = json.decode(
    #     "{\"disposition\":\"traveling-to-kingston\",\"name\":\"Spokane\",\"etaMins\":12,\"distPct\":0.48}")
    # status = json.decode(
    #     "{\"disposition\":\"docked-in-kingston\",\"name\":\"Spokane\",\"stdMins\":10}")
    # status = json.decode(
    #     "{\"disposition\":\"docked-in-edmonds\",\"name\":\"Puyallup\",\"stdMins\":4}")
    # status = json.decode(
    #     "{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Spokane\",\"etaMins\":2,\"distPct\":0.1}")
    # status = json.decode(
    #     "{\"disposition\":\"no-vessels-in-service\"}")

    return render.Root(
        child=render.Stack(
            children=[
                render.Image(src=BACKGROUND_IMG),
                renderFerry(status),
                render.Column(
                    children=[
                        render.Padding(
                            pad=(0, 24, 0, 0),
                            child=render.Row(
                                expanded=True,
                                main_align="center",
                                children=[renderDetail(status)]
                            ),
                        ),
                    ],
                )
            ],
        )
    )


'''
render.Padding(
    pad=(1, 16, 1, 1),
    child=render.Column(
        children=[render.Marquee(
            width=62,
            child=renderStatus(status)
        ),
            renderDetail(status)
        ],
    ),
),
'''
