load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")

BACKGROUND_IMG = "iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAAAXNSR0IArs4c6QAAAMlJREFUaENjTFp+7T/DCAaMWWtuIAUAIwMDA3J4DH8+Y9GGWyM7BVRtvfsfFs8jkWZs2nlvZKeArn0PR3YKmHTo0X8GhpGY+EEJn5GBcfbxpyM7Cyw6/Wxkp4BVF16CywAYgCSMkcNn3HTlNc4sgN4MQm8wDgd5xt03347sLHDo7vuRXQiefvRxZKeAS88+j+yGkGN2+8jOAqMBMJoCRrPAaBkwgocEGRhHC8HRQnC0EBwtBEcLwREcAqO1wGg1OFoNjlaDI7oaBAC/0FSQnGL1JQAAAABJRU5ErkJggg=="

FERRY_STATUS_API_LOCALHOST = "http://localhost:8082/api/status"
FERRY_STATUS_API_PRODUCTION = "https://ferry-tidbyt.humanappliance.io/api/status"
FERRY_STATUS_API = FERRY_STATUS_API_PRODUCTION


def renderStatus(status):
    if status["disposition"] == "docked-in-kingston":
        return render.Text("Docked", )
    if status["disposition"] == "traveling-to-kingston":
        return render.Text("Sailing to Kingston")
    if status["disposition"] == "docked-in-edmonds":
        return render.Text("At Edmonds")
    if status["disposition"] == "traveling-to-edmonds":
        return render.Text("Sailing to Edmonds")
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


def main(config):
    res = http.get(FERRY_STATUS_API)
    status = res.json()
    # status = json.decode(
    #    "{\"disposition\":\"traveling-to-kingston\",\"name\":\"Spokane\",\"etaMins\":12,\"distPct\":0.48}")
    # status = json.decode(
    #     "{\"disposition\":\"docked-in-kingston\",\"name\":\"Spokane\",\"stdMins\":10}")
    # status = json.decode(
    #     "{\"disposition\":\"docked-in-edmonds\",\"name\":\"Puyallup\",\"stdMins\":4}")
    # status = json.decode(
    #     "{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Spokane\",\"etaMins\":2,\"distPct\":0.1}")
    # status = json.decode(
    #    "{\"disposition\":\"no-vessels-in-service\"}")

    return render.Root(
        child=render.Stack(
            children=[
                render.Image(src=base64.decode(BACKGROUND_IMG)),
                render.Column(
                    children=[
                        render.Text(""),
                        render.Text(""),
                        render.Padding(
                            pad=(1, 0, 1, 1),
                            child=render.Column(
                                children=[render.Marquee(
                                    width=62,
                                    child=renderStatus(status)
                                ),
                                    renderDetail(status)
                                ],
                            ),
                        ),
                    ],
                )
            ],
        )
    )
