const _ = require('underscore-plus');
const $ = require('atom-space-pen-views').$;

describe("EditorStats", () => {
  let editorStats = null;
  let workspaceElement = null;
  function simulateKeyUp(key) {
    const e = $.Event("keydown", {
      keyCode: key.charCodeAt(0)
    });
    $(workspaceElement).trigger(e);
  };
  function simulateClick() {
    const e = $.Event("mouseup");
    $(workspaceElement).trigger(e);
  };
  beforeEach( () => {
    workspaceElement = atom.views.getView(atom.workspace);
    waitsForPromise( () =>
      atom.workspace.open('sample.js')
    );
    waitsForPromise( () =>
      atom.packages.activatePackage('editor-stats').then( pack =>
        editorStats = pack.mainModule.stats
      )
    )
  });
  describe("when a keyup event is triggered", () => {
    beforeEach( () => {
      expect(_.values(editorStats.eventLog)).not.toContain(1);
      expect(_.values(editorStats.eventLog)).not.toContain(2);
    });
    it("records the number of times a keyup is triggered", () => {
      simulateKeyUp('a');
      expect(_.values(editorStats.eventLog)).toContain(1);
      simulateKeyUp('b');
      expect(_.values(editorStats.eventLog)).toContain(2);
    });
  });
  describe("when a mouseup event is triggered", () =>
    it("records the number of times a mouseup is triggered", () => {
      simulateClick();
      expect(_.values(editorStats.eventLog)).toContain(1);
      simulateClick();
      expect(_.values(editorStats.eventLog)).toContain(2);
    })
  );
});
