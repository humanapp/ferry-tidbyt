load("render.star", "render")
load("http.star", "http")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")
load("math.star", "math")

BACKGROUND_IMG = base64.decode("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")
BACKGROUND_IMG_2 = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAIAAAAt/+nTAAAAAXNSR0IArs4c6QAAAStJREFUWIXtlTFuwkAURGe9f8O6o4giBU5BQ+GT0ELnM+QGuQBlSqfLDVJS0LhAoqcByVDQUZpiQ2TF68gyQv+v5FeMv9ZraWbHltUi2yJkyBqdJqPlau8UAFACCihve6TNSJOxG5arPVlSANJk9LE+uBmoKkTOAOAMkzUaQJYX8+lrlhe/e0up6vjMC2u0An4aqGoQzCYvAL42R/X+vavflnDSLZUaTp3dWFul2OgHt/1YaBBYA7UATQ1UtwuZvdCAovqqanhA2joAio0ngIBXpfUr5G3glkGg1gIE1cBfLEX/fANKoHqsJvM3bzWhQPRkuT3cBWkibg93EV3OJ24P3bmcT5G7cDvpgrPd9BMIBoqHz9weOuKcB99AH4CbPgA3fQBu+gDcBB/gCkrzA9t4b5GhAAAAAElFTkSuQmCC")
LARGE_FERRY_WEST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAANyaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QaXhlbG1hdG9yIFBybyBUcmlhbCAzLjEuMTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIyLTExLTIzVDIzOjE1OjMzLTA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpZUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Ci+1DLAAAAC8SURBVCgVY2DAAv4DARZhvEJMeGVJkGREVqu9jB/FJVejPqLIw9SCXMwIBDA+Bg1SgAzmzZz3H4RBAJkGsdE1w00FKdbR0UGRv3LlCsP8WfNRxNA5SelJYDNQDEJXRMgQmHqQYeDABrkmuaCbAR0npiWC1fZO6sVLgyTBLgIZVNOzhuH5k/tgDTBi7oRSgl4DqQW5iAWmCURLyijCuTBDZ71ph4vhYzBqa2tjxAA+Dbjk4IFNiYFXr15lBAD5bm1O4swGlwAAAABJRU5ErkJggg==")
LARGE_FERRY_EAST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAABIAAAALCAYAAAByF90EAAAAAXNSR0IArs4c6QAAAKxlWElmTU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAExAAIAAAAbAAAAZodpAAQAAAABAAAAggAAAAAAAABIAAAAAQAAAEgAAAABUGl4ZWxtYXRvciBQcm8gVHJpYWwgMy4xLjEAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAASoAMABAAAAAEAAAALAAAAANBEa8kAAAAJcEhZcwAACxMAAAsTAQCanBgAAAOgaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjExPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDx0aWZmOlhSZXNvbHV0aW9uPjcyMDAwMC8xMDAwMDwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPlBpeGVsbWF0b3IgUHJvIFRyaWFsIDMuMS4xPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMjItMTEtMjNUMjM6MjE6NDMtMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgq47FoKAAAAr0lEQVQoFWNgIBH8BwJsWpiwCZIjxoiuCWQjIxCgi4P42sv4UVxzNeojVnVgvfNmzvsPwiCATMPYYAkogWwZ3ESQQmQJdHZiWiKDjo4OivCVK1cYYK4HG0TIEJhukGHoAGYQPLB7J/WC1eCiQYYkF3RjYJAvQRqJdhHMIGQXScooMrSUhIC9xwKSmPWmHVkeKzuRAeItkGZsgFFbWxtvIGPThE0M7DVKDLt69SrYDADKb19m8UJeXgAAAABJRU5ErkJggg==")
SMALL_FERRY_WEST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAYAAADebrddAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA35pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LjgzZmFlNjQsIDIwMjIvMDIvMTUtMDg6MDc6MzIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MjUwODg0ODctMGUwNS00MmRkLWI1ZmQtZDlmMTc1YjFhZDQ1IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkEyQUYzMUFEODJBMzExRUQ4OEQ5RTM3OTlDQ0Y2OTYwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkEyQUYzMUFDODJBMzExRUQ4OEQ5RTM3OTlDQ0Y2OTYwIiB4bXA6Q3JlYXRvclRvb2w9IlBpeGVsbWF0b3IgUHJvIFRyaWFsIDMuMS4xIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjUwODg0ODctMGUwNS00MmRkLWI1ZmQtZDlmMTc1YjFhZDQ1IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDdlYjE3YmUtY2FjMy0xMTgwLWE2MTMtZWM4MzI1MjBkOGZhIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+lH+pAgAAAIBJREFUeNpi+P//PwMM/EfmoAGQFBOMo72M/7/OcgFsiuAGMILYjIyMDPNmzoMLJqYlMsyfNR+uISk9CaIOqhGuEFkRMgAawAh2Rk3PGobkgm4wBpkKAr2TelFouDOAiuEmt5SEMFi2qWGYfLzqFiNYsY6ODs5QgIErV64wAgQYAJXxPqGtXa+jAAAAAElFTkSuQmCC")
SMALL_FERRY_EAST_IMG = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAsAAAAHCAYAAADebrddAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA41pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LjgzZmFlNjQsIDIwMjIvMDIvMTUtMDg6MDc6MzIgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YTYzYjEyYWMtNjU2Ny00NDRmLTgzZGEtMzk2NjYwYjVkYzMzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkEyQUYzMUE5ODJBMzExRUQ4OEQ5RTM3OTlDQ0Y2OTYwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkEyQUYzMUE4ODJBMzExRUQ4OEQ5RTM3OTlDQ0Y2OTYwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBFbGVtZW50cyAyMS4wIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZWY4ZjFhNGMtZmNiNi00YmJkLTk5ZjktNjAzNmQ1NzFkNjEzIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDdlYjE3YmUtY2FjMy0xMTgwLWE2MTMtZWM4MzI1MjBkOGZhIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+onPcTAAAAHpJREFUeNpi+P//PwMu8B9JEsRkwiYBAzrLBRi0l/HDxRlBahgZGRnmzZwHF0xMS2SYP2s+XFNSehJEHYgASmB1C0gTEmCEO6N3Ui8KDVKYXNANxjU9axDOsGxTwzD5eNUtuCIQaCkJYQQr1tHRwR0kUHDlyhVGgAADAEXJPqGM3tGDAAAAAElFTkSuQmCC")
WAKE_WEST_ANIM = base64.decode("UklGRuQBAABXRUJQVlA4WAoAAAACAAAAEAAAAAAAQU5JTQYAAAAAAAD/AABBTk1GZgAAAAAAAAAAABAAAAAAAOgDAAJWUDggTgAAAJADAJ0BKhEAAQA+kTiXR6WjIiEwCACwEgliAJ0ygxgANbjeioAA/k+bT+AE2d/xcfn0l4ku6xAZ1pzAlI9rsKvX/X+3uwFH4qJjyIAAAEFOTUZyAAAAAAAAAAAAEAAAAAAA6AMAAFZQOCBaAAAAFAQAnQEqEQABAD6ROphHgwCAAAEglkAJ0yhHA3oG8AhAD+AAPAfhEoAA/q3U8ffHLbrX9Hh8j2NCr5maNicMny4A0n6WQs751GMA+SxU9Vnj/ARfuSg60wAAQU5NRmIAAAAAAAAAAAAQAAAAAADoAwAAVlA4IEoAAABUAwCdASoRAAEAPpE6l0eDAIAAASCUATplCO4gwAB4D8JLAAD+5arvGH5rseULV8oLO1Sh8JRq8OIdONRnthUupJx8eWcTiYzoAEFOTUZmAAAAAAAAAAAAEAAAAAAA6AMAAFZQOCBOAAAANAMAnQEqEQABAD6ROplHgwCAAAEgliAJ0yhHAAHoPwiUAAD+5r4dM74DnpyofGf1udXe6xA3YQQD7SG8SZrlCSVytfabXjTGY4O9AAAA")
WAKE_EAST_ANIM = base64.decode("UklGRtABAABXRUJQVlA4WAoAAAACAAAAEAAAAAAAQU5JTQYAAAD/////AABBTk1GYAAAAAAAAAAAABAAAAAAAOgDAABWUDggSAAAAFADAJ0BKhEAAQA+kTqYR6WjIqEwCACwEgljALsvAAFUESwQAP7Wv7zb1Xq+SCL/3/f3uvY/b/lht6cgsQv1dKdEf1RGqUPAAEFOTUZoAAAAAAAAAAAAEAAAAAAA6AMAAFZQOCBQAAAAUAMAnQEqEQABAD6ROpdHpaMiITAIALASCUATplAATU39JgAA/gZ2dlPiALr6N5J/H1uH+cyjo3kf38LtzBB9fpznuxk8mP7w5bWwoIe8AABBTk1GYgAAAAAAAAAAABAAAAAAAOgDAABWUDggSgAAABADAJ0BKhEAAQA+kTqYR6WjIqEwCACwEglAAAm3+xg2gAD+VQHfrcEf4Al7D7Uxv4/59kFv/y+lXW6UFLV/+v5kqfPF/R/aEgAAQU5NRmIAAAAAAAAAAAAQAAAAAADoAwAAVlA4IEoAAAAQAwCdASoRAAEAPpE6mEeloyKhMAgAsBIJYwAAQrccuAAA/ta/vl4g7sn/vs+N/wl2ouPuYAS3/Wy6LxWytn/+q3stYibD7mIAAA==")
SMALL_WAKE_WEST_ANIM = base64.decode("UklGRkwCAABXRUJQVlA4WAoAAAACAAAACAAAAAAAQU5JTQYAAAAAAAAAAABBTk1GgAAAAAAAAAAAAAgAAAAAAOgDAAJWUDggaAAAAPACAJ0BKgkAAQABQCYlsAJ0fwqgD8AHYAfoACLy0kaAAP6t/Okf/DoVFpf+mx+uvyUH/w5m//pB7/827gNh/mX/wIq/df/gb0ac/+BFX7r/8DTv9V/+HqX7R/4Hue7//h6l+0f+AAAAQU5NRooAAAAAAAAAAAAIAAAAAADoAwAAVlA4IHIAAAAQAwCdASoJAAEAAUAmJbACdH8KoA/AB2AH8A/wAHgPvuAA/ub+io/4t/r0QXeYcfyfxmn/Fhf/9PEP/m4//tICMc1/in/w9S/df/Yt1q+y//h6l+6/+xu/6d/6r/8CKv2j/wQxGDDX//wIq/aP/AAAAABBTk1GfgAAAAAAAAAAAAgAAAAAAOgDAABWUDggZgAAANACAJ0BKgkAAQABQCYlsAJ0fwqgD8AHYAfoAB4D65AA/vSvOW/hn/pK/4JpCrwz8ev/HiH/zcf/2kBGH+Kf/Air91/+BvRpz/4EVfuv/wNO/1X/4epftH/ge57v/+HqX7R/4AAAAEFOTUaAAAAAAAAAAAAACAAAAAAA6AMAAFZQOCBoAAAA0AIAnQEqCQABAAFAJiWwAnR/CqAPwAdgB+gAHgPvuAD+9MUprBX+m7Jc6/+mx/rN0rFHxX/6SA/+GggRh/in/w9S/df/gb0ac/+HqX7r/8ENGv+2P/Air9o/7G58+hv/Air9o/7AAAA=")
SMALL_WAKE_EAST_ANIM = base64.decode("UklGRlACAABXRUJQVlA4WAoAAAACAAAACAAAAAAAQU5JTQYAAAAAAAAAAABBTk1GhgAAAAAAAAAAAAgAAAAAAOgDAABWUDggbgAAAPACAJ0BKgkAAQABQCYlsAJ0fwqgD8AHYAfoACLy0kaAAP7ykJZz/9Nj5q/fj/gf/02P9qPXnf/TY2f/5VR/+MXvAYb+xf/h6l+6//A07xz/4epfuv/wPm/4n/8CKv3X/4IEHMX/gRV+6//AAAAAQU5NRoIAAAAAAAAAAAAIAAAAAADoAwAAVlA4IGoAAADQAgCdASoJAAEAAUAmJbACdH8KoA/AB2AH6AAeA+uQAP71TjvOv/oPbP7vcYRfryIdsf/Qe/KX/z/y97Di0ZT+xf/h6l+6//A07xz/4epfuv/wPm/4n/8CKv3X/4IEHMX/gRV+6//AAAAAQU5NRoIAAAAAAAAAAAAIAAAAAADoAwAAVlA4IGoAAADwAgCdASoJAAEAAUAmJbACdH8KoA/AB2AH6AAm167zUAD++QRqyoH4X/cTpn/0Hv3l36uN+Hf/jww//1LL4z/9i//D1L91/+Bp3jn/w9S/df/gfN/xP/4EVfuv/wQIOYv/Air91/+AAAAAQU5NRoIAAAAAAAAAAAAIAAAAAADoAwAAVlA4IGoAAADQAgCdASoJAAEAAUAmJbACdIHKoA/AB2AH6AAeA+uQAP7ydk8//cI/XvmK/Xvwz/MVLp/9wj/Yr/48MP/9sAVb/O//h6l+6//A1z1r/8PUv3X/4FQ/6r/8CKv3X/4HV+0//gRV+6//AAAA")
THERMO_GREEN_LEFT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAEZJREFUGJXFj7ENwDAMw6j+4mf8jG/xxerUNAgypFO5ioAkmKgqsyMzvQrX1vwxBN6lD2PxGtgel751StJRp2YhIgDobgHcPFUbAGo2mIgAAAAASUVORK5CYII=")
THERMO_GREEN_RIGHT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAEVJREFUGJXFj7ENwDAMw6ic52f8nZ/xMe7koEgypFO1koAkeMXdi1MamNkUxtH8EQL7hbm4QVVtwl2nJH3q1CpkJhEhgAeZFR4AnbtDxAAAAABJRU5ErkJggg==")
THERMO_YELLOW_LEFT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAFxJREFUGJXFjsENgCAQBAd7oZlr5mqhGdrAjwVgI+sHkCgPf06yySW3ySxMuLtYYWZ6FrZl88cncC/tjMVmppKRaoskVeTu+ubcj3ac4e0smZHuDHMhxghASikAXPcpMDGdiPnUAAAAAElFTkSuQmCC")
THERMO_YELLOW_RIGHT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAFpJREFUGJXFjzEOgDAMA688L5/J7/KNdmHqVD5iBtQIQQc2LEUZbOlsuMndxUrTMLMMbMvkjybwnpCN3V0aSNL1B6qBzEwfmUcBoO0LZg3yJrM8S/XeiYgCcAI8gDMxm4sQ1wAAAABJRU5ErkJggg==")
THERMO_ORANGE_LEFT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAHVJREFUGJWVjrENg1AMRJ+zB+VvaLPFDYNTZAI2MCuwA1NkhixCYQrCV4Sg+CdZsnxPvoM/uXtyJUl5Bh6XZLOZQd6aTW+BvennTWbsczQ2STn2C8/uRw4Jk/H6emvmZHW1I3Psl3qcVycirGKSspQCQEQYwAaPWCd7FX3DRAAAAABJRU5ErkJggg==")
THERMO_ORANGE_RIGHT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAGRJREFUGJWVkLENgDAMBM9ILJcdmCENNTuEYTwFNU2GeQoUCylBgi99p7dleCTnLEZpIKUUwjQ0f0MV9Ap/1QL3pSpIBR0riosDSJ3wceduHbRWvcwlhtuZcHcLvb2v1oq7G8AFRyk1P/XXrTAAAAAASUVORK5CYII=")
THERMO_RED_LEFT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAFhJREFUGJXFjsEJgEAMBOcswcdZwTWTZlJLytNahPWhJ6fk4c+FQGAHZmGIu4ssZiZVNAJTSv5YAufSdUaqPBe/C0k38M257dezlNzZrzvLCLTWAIiIAnAAdL0y9GsxU5oAAAAASUVORK5CYII=")
THERMO_RED_RIGHT = base64.decode("iVBORw0KGgoAAAANSUhEUgAAAAcAAAANCAYAAABlyXS1AAAAAXNSR0IArs4c6QAAAFdJREFUGJXFjrENgDAQA+8ZIUXYKcv8dtkl/CpIpiJE4gs6LLnySWdY4u4ii7tLFbXWJrCl5I8j8DxVRaMsj+cgvYCPzt0AOM7EOQqzt9NWACAi6L0bwAW2vTX0ihCXyQAAAABJRU5ErkJggg==")
LARGE_FERRY_IMG_WIDTH = 18
LARGE_FERRY_IMG_HEIGHT = 11
SMALL_FERRY_IMG_WIDTH = 11
SMALL_FERRY_IMG_HEIGHT = 7
WAKE_ANIM_WIDTH = 17
WAKE_ANIM_HEIGHT = 1
SMALL_WAKE_ANIM_WIDTH = 9
SMALL_WAKE_ANIM_HEIGHT = 1
DOCK_WIDTH = 6
TRAVEL_DIST = 52

FERRY_API_BASE_LOCALHOST = "http://localhost:8082"
FERRY_API_BASE_PRODUCTION = "https://ferry-tidbyt.humanappliance.io"
FERRY_API_BASE = FERRY_API_BASE_PRODUCTION

FERRY_STATUS_API = FERRY_API_BASE + "/api/status"
FERRY_WAITTIME_API = FERRY_API_BASE + "/api/waittimes"

DOCKED_IN_KINGSTON = "docked-in-kingston"
TRAVELING_TO_KINGSTON = "traveling-to-kingston"
DOCKED_IN_EDMONDS = "docked-in-edmonds"
TRAVELING_TO_EDMONDS = "traveling-to-edmonds"

KINGSTON = "kingston"
TRAVELING = "traveling"
DISPOSITION = "disposition"

def renderDetail(ferry):
    text = ""
    name = ""
    if ferry != None:
        name = ferry["name"]
    if ferry == None:
        text = "No vessels"
    elif ferry[DISPOSITION] == DOCKED_IN_KINGSTON:
        if "stdMins" in ferry.keys():
            text = "dep %d mins" % ferry["stdMins"]
        else:
            text = "Docked"
    elif ferry[DISPOSITION] == TRAVELING_TO_KINGSTON:
        if "etaMins" in ferry.keys():
            text = "eta %d mins" % ferry["etaMins"]
        else:
            text = "Sailing"
    elif ferry[DISPOSITION] == DOCKED_IN_EDMONDS:
        if "stdMins" in ferry.keys():
            text = "dep %d mins" % ferry["stdMins"]
        else:
            text = "Docked"
    elif ferry[DISPOSITION] == TRAVELING_TO_EDMONDS:
        text = "Sailing"
    return render.Padding(
        pad=(0, 17, 0, 0),
        child=render.Column(
            expanded=True,
            children=[
                render.Row(
                    expanded=True,
                    main_align="center",
                    children=[
                        render.Text(content=name, color="#d3e6f3")
                    ]
                ),
                render.Row(
                    expanded=True,
                    main_align="center",
                    children=[
                        render.Padding(
                            pad=(0, 1, 0, 0),
                            child=render.Text(content=text, font="tom-thumb", color="#9bc7e5")
                        )
                    ]
                )
            ]
        )
    )


def largeFerryImg(ferry):
    west = ferry[DISPOSITION].find(KINGSTON)
    if west >= 0:
        ferry = LARGE_FERRY_WEST_IMG
    else:
        ferry = LARGE_FERRY_EAST_IMG
    return ferry

def smallFerryImg(ferry):
    west = ferry[DISPOSITION].find(KINGSTON)
    if west >= 0:
        ferry = SMALL_FERRY_WEST_IMG
    else:
        ferry = SMALL_FERRY_EAST_IMG
    return ferry

def wakeAnim(ferry):
    west = ferry[DISPOSITION].find(KINGSTON)
    if west >= 0:
        ferry = WAKE_WEST_ANIM
    else:
        ferry = WAKE_EAST_ANIM
    return ferry

def smallWakeAnim(ferry):
    west = ferry[DISPOSITION].find(KINGSTON)
    if west >= 0:
        ferry = SMALL_WAKE_WEST_ANIM
    else:
        ferry = SMALL_WAKE_EAST_ANIM
    return ferry


def renderSmallFerry(ferry):
    if ferry == None:
        return render.Box(width=0, height=0)
    
    topPad = 9
    maxDist = TRAVEL_DIST - SMALL_FERRY_IMG_WIDTH
    ferryImg = smallFerryImg(ferry)

    if ferry[DISPOSITION] == DOCKED_IN_KINGSTON:
        return render.Padding(
            pad=(DOCK_WIDTH, topPad, 0, 0),
            child=render.Image(src=ferryImg)
        )
    if ferry[DISPOSITION] == TRAVELING_TO_KINGSTON:
        leftPad = maxDist
        if "distPct" in ferry.keys():
            leftPad = math.floor(maxDist * ferry["distPct"])
            return render.Padding(
                pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
                child=render.Image(src=ferryImg)
            )
    if ferry[DISPOSITION] == DOCKED_IN_EDMONDS:
        return render.Padding(
            pad=(DOCK_WIDTH + maxDist, topPad, 0, 0),
            child=render.Image(src=ferryImg)
        )
    if ferry[DISPOSITION] == TRAVELING_TO_EDMONDS:
        leftPad = 0
        if "distPct" in ferry.keys():
            leftPad = math.floor(maxDist * ferry["distPct"])
            return render.Padding(
                pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
                child=render.Image(src=ferryImg)
            )
    return render.Box(width=0, height=0)

def renderLargeFerry(ferry):
    if ferry == None:
        return render.Box(width=0, height=0)
    
    topPad = 6
    maxDist = TRAVEL_DIST - LARGE_FERRY_IMG_WIDTH
    ferryImg = largeFerryImg(ferry)

    if ferry[DISPOSITION] == DOCKED_IN_KINGSTON:
        return render.Padding(
            pad=(DOCK_WIDTH, topPad, 0, 0),
            child=render.Image(src=ferryImg)
        )
    if ferry[DISPOSITION] == TRAVELING_TO_KINGSTON:
        leftPad = maxDist
        if "distPct" in ferry.keys():
            leftPad = math.floor(maxDist * ferry["distPct"])
        return render.Padding(
            pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
            child=render.Image(src=ferryImg)
        )
    if ferry[DISPOSITION] == DOCKED_IN_EDMONDS:
        return render.Padding(
            pad=(DOCK_WIDTH + maxDist, topPad, 0, 0),
            child=render.Image(src=ferryImg)
        )
    if ferry[DISPOSITION] == TRAVELING_TO_EDMONDS:
        leftPad = 0
        if "distPct" in ferry.keys():
            leftPad = math.floor(maxDist * ferry["distPct"])
    return render.Padding(
        pad=(DOCK_WIDTH + leftPad, topPad, 0, 0),
        child=render.Image(src=ferryImg)
    )
    return render.Box(width=0, height=0)


def renderWake(ferry):
    if ferry == None:
        return render.Box(width=0, height=0)

    sailing = ferry[DISPOSITION].find(TRAVELING)
    if sailing >= 0:
        west = ferry[DISPOSITION].find(KINGSTON)
        wake = wakeAnim(ferry)
        maxDist = TRAVEL_DIST - LARGE_FERRY_IMG_WIDTH
        topPad = 6
        if west >= 0:
            if "distPct" in ferry.keys():
                leftPad = math.floor(maxDist * ferry["distPct"])
                return render.Padding(
                    pad=(3 + LARGE_FERRY_IMG_WIDTH + leftPad, topPad + LARGE_FERRY_IMG_HEIGHT - 1, 0, 0),
                    child=render.Image(src=wake)
                )
        else:
            if "distPct" in ferry.keys():
                leftPad = math.floor(maxDist * ferry["distPct"])
                return render.Padding(
                    pad=(9 - WAKE_ANIM_WIDTH + leftPad, topPad + LARGE_FERRY_IMG_HEIGHT - 1, 0, 0),
                    child=render.Image(src=wake)
                )
    return render.Box(width=0, height=0)

def renderSmallWake(ferry):
    if ferry == None:
        return render.Box(width=0, height=0)

    sailing = ferry[DISPOSITION].find(TRAVELING)
    if sailing >= 0:
        west = ferry[DISPOSITION].find(KINGSTON)
        wake = smallWakeAnim(ferry)
        maxDist = TRAVEL_DIST - SMALL_FERRY_IMG_WIDTH
        topPad = 9
        if west >= 0:
            if "distPct" in ferry.keys():
                leftPad = math.floor(maxDist * ferry["distPct"])
                return render.Padding(
                    pad=(3 + SMALL_FERRY_IMG_WIDTH + leftPad, topPad + SMALL_FERRY_IMG_HEIGHT - 1, 0, 0),
                    child=render.Image(src=wake)
                )
        else:
            if "distPct" in ferry.keys():
                leftPad = math.floor(maxDist * ferry["distPct"])
                return render.Padding(
                    pad=(9 - SMALL_WAKE_ANIM_WIDTH + leftPad, topPad + SMALL_FERRY_IMG_HEIGHT - 1, 0, 0),
                    child=render.Image(src=wake)
                )
    return render.Box(width=0, height=0)


def renderLeftThermo(color):
  if color == "green":
    image = THERMO_GREEN_LEFT
  elif color == "yellow":
    image = THERMO_YELLOW_LEFT
  elif color == "orange":
    image = THERMO_ORANGE_LEFT
  elif color == "red":
    image = THERMO_RED_LEFT

  if color != None:
    return render.Padding(
      pad=(-1, 7, 0, 0),
      child=render.Image(image)
    )
  return render.Box(width=0, height=0)

def renderRightThermo(color):
  if color == "green":
    image = THERMO_GREEN_RIGHT
  elif color == "yellow":
    image = THERMO_YELLOW_RIGHT
  elif color == "orange":
    image = THERMO_ORANGE_RIGHT
  elif color == "red":
    image = THERMO_RED_RIGHT

  if color != None:
    return render.Padding(
      pad=(58, 7, 0, 0),
      child=render.Image(image)
    )
  return render.Box(width=0, height=0)

def main(config):
    statusres = http.get(FERRY_STATUS_API)
    status = statusres.json()
    waittimesres = http.get(FERRY_WAITTIME_API)
    waittimes = waittimesres.json()

    #~~some test data~~
    #status = json.decode("[{\"disposition\":\"docked-in-edmonds\",\"name\":\"Kaleetan\",\"stdMins\":0},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Puyallup\",\"etaMins\":15,\"distPct\":0.3}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Kaleetan\",\"distPct\":0.98},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Puyallup\",\"etaMins\":13,\"distPct\":0.45}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Kaleetan\",\"etaMins\":20,\"distPct\":0.87},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Puyallup\",\"etaMins\":10,\"distPct\":0.6}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Kaleetan\",\"etaMins\":20,\"distPct\":0.87}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Kaleetan\",\"etaMins\":8,\"distPct\":0.2},{\"disposition\":\"docked-in-edmonds\",\"name\":\"Puyallup\",\"stdMins\":19}]")
    #status = json.decode("[{\"disposition\":\"docked-in-kingston\",\"name\":\"Kaleetan\",\"stdMins\":14},{\"disposition\":\"docked-in-edmonds\",\"name\":\"Puyallup\",\"stdMins\":9}]")
    #status = json.decode("[{\"disposition\":\"docked-in-kingston\",\"name\":\"Kaleetan\",\"stdMins\":4},{\"disposition\":\"traveling-to-kingston\",\"name\":\"Puyallup\",\"distPct\":0.99}]")
    #status = json.decode("[{\"disposition\":\"docked-in-kingston\",\"name\":\"Kaleetan\",\"stdMins\":1},{\"disposition\":\"traveling-to-kingston\",\"name\":\"Puyallup\",\"etaMins\":19,\"distPct\":0.91}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Puyallup\",\"etaMins\":16,\"distPct\":0.72},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Kaleetan\",\"distPct\":0.01}]")
    #status = json.decode("[{\"disposition\":\"traveling-to-kingston\",\"name\":\"Puyallup\",\"etaMins\":13,\"distPct\":0.51},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Kaleetan\",\"etaMins\":20,\"distPct\":0.12}]")
    #status = json.decode("[{\"disposition\":\"docked-in-kingston\",\"name\":\"Puyallup\",\"stdMins\":10},{\"disposition\":\"traveling-to-edmonds\",\"name\":\"Kaleetan\",\"etaMins\":7,\"distPct\":0.88}]")
    #status = json.decode("[]")
    #status = json.decode("[{\"order\":1,\"disposition\":\"docked-in-kingston\",\"name\":\"Puyallup\"},{\"order\":1,\"disposition\":\"docked-in-kingston\",\"name\":\"Spokane\"},{\"order\":3,\"disposition\":\"docked-in-edmonds\",\"name\":\"Tacoma\"}]")

    if len(status) >= 1:
        largeFerryStatus = status[0]
    else:
        largeFerryStatus = None

    children = [render.Image(src=BACKGROUND_IMG_2)]

    for i in range(1,len(status)):
      smallFerryStatus = status[i]
      children.append(renderSmallFerry(smallFerryStatus))
      children.append(renderSmallWake(smallFerryStatus))

    if largeFerryStatus != None:
      children.append(renderLargeFerry(status[0]))
      children.append(renderWake(status[0]))

    children.append(renderDetail(largeFerryStatus))

    children.append(renderLeftThermo(waittimes["left"]))
    children.append(renderRightThermo(waittimes["right"]))

    return render.Root(
        delay=1000,
        child=render.Stack(
            children=children
        )
    )
