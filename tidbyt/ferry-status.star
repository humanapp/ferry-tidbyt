load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")

FERRY_STATUS_API_LOCALHOST = "http://localhost:8082/api/status"
FERRY_STATUS_API_PRODUCTION = "https://ferry-tidbyt.humanappliance.io/api/status"
FERRY_STATUS_API = FERRY_STATUS_API_PRODUCTION

def renderStatus(status):
    if (status["disposition"] == "docked-in-kingston"):
        return render.Text("Docked")
    if (status["disposition"] == "traveling-to-kingston"):
        return render.Text("Sailing to Kingston")
    if (status["disposition"] == "docked-in-edmonds"):
        return render.Text("At Edmonds")
    if (status["disposition"] == "traveling-to-edmonds"):
        return render.Text("Sailing to Edmonds")
    if (status["disposition"] == "no-vessels-in-service"):
        return render.Text("No vessel in service")
    return render.Text("")


def renderDetail(status):
    if (status["disposition"] == "docked-in-kingston"):
        if (status["stdMins"]):
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("")
    if (status["disposition"] == "traveling-to-kingston"):
        if (status["etaMins"] != None):
            return render.Text("eta %d mins" % status["etaMins"])
        else:
            return render.Text("")
    if (status["disposition"] == "docked-in-edmonds"):
        if (status["stdMins"]):
            return render.Text("dep %d mins" % status["stdMins"])
        else:
            return render.Text("")
    if (status["disposition"] == "traveling-to-edmonds"):
        return render.Text("")
    if (status["disposition"] == "no-vessels-in-service"):
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
        child=render.Column(
            children=[
                render.Marquee(
                    width=64,
                    child=renderStatus(status)
                ),
                renderDetail(status)
            ],
        )
    )
