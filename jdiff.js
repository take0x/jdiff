const diffoutputdiv = byId("diffoutput");

function byId(id) {
  return document.getElementById(id);
}

function diffUsingJS(actual, expected) {
	const base = difflib.stringAsLines(actual);
	const newtxt = difflib.stringAsLines(expected);
	const sm = new difflib.SequenceMatcher(base, newtxt);
	const opcodes = sm.get_opcodes();

	diffoutputdiv.appendChild(diffview.buildView({
		baseTextLines: base,
		newTextLines: newtxt,
		opcodes: opcodes,
		baseTextName: "実際の出力",
		newTextName: "期待される出力",
		contextSize: null,
		viewType: 0
	}));
}

byId("file").addEventListener("change", function (event) {
  const file = event.target.files;
  const reader = new FileReader();
  reader.readAsText(file[0]);

  reader.onload = function () {
    const raw = reader.result;
    const parser = new DOMParser();
    const doc = parser.parseFromString(reader.result, "application/xml");
    const errorNode = doc.querySelector("parsererror");

    diffoutputdiv.innerHTML = "";

    if (errorNode) {
      console.log("Error: " + errorNode.textContent);
      return;
    }

    const failures = doc.documentElement.getElementsByTagName("failure");

    if (failures.length === 0) {
      diffoutputdiv.innerHTML = "差分が見つかりませんでした．"
      return;
    }

    for (let failure of failures) {
      const message = failure.getAttribute("message");
      const xml_actual = message.split("but was: <")[1].slice(0, -1);
      const xml_expected = message.split("expected: <")[1].split("> but was:")[0];
      const actualPos =  raw.replace(/\n/g, " ").indexOf(xml_actual);
      const expectedPos = raw.replace(/\n/g, " ").indexOf(xml_expected);
      const actual = raw.slice(actualPos, actualPos + xml_actual.length);
      const expected = raw.slice(expectedPos, expectedPos + xml_expected.length);
      diffUsingJS(actual, expected);
    }
  }
});
