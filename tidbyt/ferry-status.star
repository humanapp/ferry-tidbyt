load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")
load("math.star", "math")

BACKGROUND_IMG = base64.decode("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")
FERRY_WEST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAANyaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIFBybyBUcmlhbCAzLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIyLTExLTIzVDIzOjE1OjMzLTA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Ci+1DLAAAAC8SURBVCgVY2DAAv4DARZhvEJMeGVJkGREVqu9jB/FJVejPqLIw9SCXMwIBDA+Bg1SgAzmzZz3H4RBAJkGsdE1w00FKdbR0UGRv3LlCsP8WfNRxNA5SelJYDNQDEJXRMgQmHqQYeDABrkmuaCbAR0npiWC1fZO6sVLgyTBLgIZVNOzhuH5k/tgDTBi7oRSgl4DqQW5iAWmCURLyijCuTBDZ71ph4vhYzBqa2tjxAA+Dbjk4IFNiYFXr15lBAD5bm1O4swGlwAAAABJRU5ErkJggg==")
FERRY_EAST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAAOgaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPlBpeGVsbWF0b3IgUHJvIFRyaWFsIDMuMS4xPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMjItMTEtMjNUMjM6MjE6NDMtMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgq47FoKAAAAr0lEQVQoFWNgIBH8BwJsWpiwCZIjxoiuCWQjIxCgi4P42sv4UVxzNeojVnVgvfNmzvsPwiCATMPYYAkogWwZ3ESQQmQJdHZiWiKDjo4OivCVK1cYYK4HG0TIEJhukGHoAGYQPLB7J/WC1eCiQYYkF3RjYJAvQRqJdhHMIGQXScooMrSUhIC9xwKSmPWmHVkeKzuRAeItkGZsgFFbWxtvIGPThE0M7DVKDLt69SrYDADKb19m8UJeXgAAAABJRU5ErkJggg==")
WAKE_WEST_ANIM = base64.decode("UklGRmACAABXRUJQVlA4WAoAAAACAAAAHQAAAAAAQU5JTQYAAAAAAAD/AABBTk1GiAAAAAAAAAAAAB0AAAAAAOgDAAJWUDggcAAAAFAFAJ0BKh4AAQA+kTqaR6WjoqEwCACwEgllAFMDUAP4BHAFsxfpNuV/jNu/6XOq54uCPAD+0r90ryVBNFPVrV25+h+ut05hGc7DqwZW8wDzBJGorL//y1eOT7YHqIT9HBjhaDK07kI8WsBChXEkAABBTk1GgAAAAAAAAAAAAB0AAAAAAOgDAABWUDggaAAAADQEAJ0BKh4AAQA+kTqXR4MAgAABIJQAR4AYhXcAP5X9gG9/o9MSEErIAAD+9v/j+lnGLOx1NGHg1vCof/kw+Zb4//06FTEZVf+wqqE0Xfo3LjlsL/CmwiiAN1zXCf9rLp+0Gvm39fAAQU5NRpQAAAAAAAAAAAAdAAAAAADoAwAAVlA4IHwAAABUBACdASoeAAEAPpE4l0eDAIAAASCWMALuq3QD1AP0AG1/p8hIEfJILJKcAP77n6YP+3u8VV9f9olxjv//zcPrky5X/8NjE8SlLagYv6MVdEZ208df9paJ8Pe+LaiJDJ//i42IDIGbccvRUBLCfYh6uBxvYHiFjYMLZQAAQU5NRoAAAAACAAAAAAAZAAAAAADoAwAAVlA4IGgAAACUAwCdASoaAAEAPpFEmkiDAIAAASCUAEIAfoAawAOy4Ss68FhAAP7ITFCXfigJr0rH/sM9R2l74wen5VdCIwT/ta7p4XD05q3f6GXm/8XEXurroMmBF6yPB3gBYDbfqRXVLzVIt+lwAA==")
WAKE_EAST_ANIM = base64.decode("UklGRmICAABXRUJQVlA4WAoAAAACAAAAHQAAAAAAQU5JTQYAAAD/////AABBTk1GhAAAAAAAAAAAAB0AAAAAAOgDAABWUDggbAAAAFAEAJ0BKh4AAQA+kTiXR6WjIiEwCACwEglAF2DqAFwxfksp/i9ALTshzIQAzj82o495X+I//FX+9ikhU944XqZiI5hDOg3Z7syjFWrnMzlybf/y49X76H///HbUKaKx//eu1FyMn4BQHhQAAEFOTUaCAAAAAAAAAAAAHQAAAAAA6AMAAFZQOCBqAAAAkAQAnQEqHgABAD6ROphHpaMioTAIALASCUAXYj/8lwH9JuAGz/iTMTDyX/wAAPl5Y28lVnv//69uZDmaBjJv4rgXEEWtvKRfN1WCp5wqjQ805X3KuxOzk/+jzVf+N6y7r2TW1sFLDIwAAEFOTUaMAAAAAAAAAAAAHQAAAAAA6AMAAFZQOCB0AAAAUAUAnQEqHgABAD6ROphHpaOioTAIALASCWIAnR/CP/22BugBbldwA/qu1/iTMTX3RM6AAP7KvS9+9HvWgNP01pi7rydgX/+LuZt98D1QEsR5ymp7f0aWzbfmJ89KccPLknX/8BXVTUafD/tS3MiGZtVoAABBTk1GjAAAAAAAAAAAAB0AAAAAAOgDAABWUDggdAAAABAFAJ0BKh4AAQA+kTqaSCWjIqEwCACwEglAE6XgLj/KABcOHsB/K9r/GkwBkzRQQcAA/sq0S//8eVOxMak+oxnT3/V1O4FN9ZdhVGa1XIOKEE/a/ORrdkx/njtvHwmZhevvu9zYv/aSMsRDO271xfM9kQAA")

FERRY_IMG_WIDTH = 18
FERRY_IMG_HEIGHT = 11
WAKE_ANIM_WIDTH = 30
WAKE_ANIM_HEIGHT = 1
DOCK_WIDTH = 6
TRAVEL_DIST = 52

FERRY_STATUS_API_LOCALHOST = "http://localhost:8082/api/status"
FERRY_STATUS_API_PRODUCTION = "https://ferry-tidbyt.humanappliance.io/api/status"
FERRY_STATUS_API = FERRY_STATUS_API_PRODUCTION

'''
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
'''

def renderDetail(status):
    if status["disposition"] == "docked-in-kingston":
        if "stdMins" in status.keys():
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("Docked")
    if status["disposition"] == "traveling-to-kingston":
        if "etaMins" in status.keys():
            return render.Text("eta %d mins" % status["etaMins"])
        else:
            return render.Text("<< KIN")
    if status["disposition"] == "docked-in-edmonds":
        if "stdMins" in status.keys():
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("Docked")
    if status["disposition"] == "traveling-to-edmonds":
        return render.Text(">> EDM")
    if status["disposition"] == "no-vessels-in-service":
        return render.Text("No vessels")
    return render.Text("")


def renderFerryCore(status):
    west = status["disposition"].find("kingston") >= 0
    sailing = status["disposition"].startswith("traveling")
    if west:
        ferry = FERRY_WEST_IMG
    else:
        ferry = FERRY_EAST_IMG
    if sailing:
        if west:
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
            return render.Stack(
                children=[
                    render.Image(src=ferry),
                    render.Padding(
                        pad=(3 - WAKE_ANIM_WIDTH, FERRY_IMG_HEIGHT - 1, 0, 0),
                        child=render.Image(src=WAKE_EAST_ANIM)
                    )
                ]
            )
    else:
        return render.Image(src=ferry)


def renderFerry(status):
    maxDist = TRAVEL_DIST - FERRY_IMG_WIDTH
    topPad = 6
    if status["disposition"] == "docked-in-kingston":
        return render.Padding(
            pad=(DOCK_WIDTH, topPad, 0, 0),
            child=renderFerryCore(status)
        )
    if status["disposition"] == "traveling-to-kingston":
        leftPad = maxDist
        if "distPct" in status.keys():
            leftPad = math.floor(maxDist * status["distPct"])
            return render.Padding(
                pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
                child=renderFerryCore(status)
            )
    if status["disposition"] == "docked-in-edmonds":
        return render.Padding(
            pad=(DOCK_WIDTH + maxDist, topPad, 0, 0),
            child=renderFerryCore(status)
        )
    if status["disposition"] == "traveling-to-edmonds":
        leftPad = 0
        if "distPct" in status.keys():
            leftPad = math.floor(maxDist * status["distPct"])
            return render.Padding(
                pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
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
    status = json.decode(
         "{\"disposition\":\"docked-in-kingston\",\"name\":\"Spokane\",\"stdMins\":10}")
    # status = json.decode(
    #     "{\"disposition\":\"docked-in-edmonds\",\"name\":\"Puyallup\",\"stdMins\":4}")
    #status = json.decode(
    #     "{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Spokane\",\"etaMins\":2,\"distPct\":0.76}")
    # status = json.decode(
    #     "{\"disposition\":\"no-vessels-in-service\"}")

    return render.Root(
        child=render.Stack(
            children=[
                render.Image(src=BACKGROUND_IMG),
                renderFerry(status),
                render.Column(
                    expanded=True,
                    children=[
                        render.Padding(
                            pad=(0, 20, 0, 0),
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
