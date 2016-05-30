import * as core from "@mabel/core";

let mabel = "mabel" in window && window.mabel ? window.mabel : {};
mabel.core = core;

window.mabel = mabel;
