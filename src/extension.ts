import * as vscode from "vscode";

type Row = {
  value: string;
  index: number;
  count: number;
};

const currentDuplicatedDecorations: vscode.TextEditorDecorationType[] = [];
let alertShowed = false;

function getDuplicatedValues(values: string[]) {
  return values
    .map((value, index) => ({
      //returning a list of object of {value, index, count} structure
      value,
      index,
      count: values.filter((v) => v === value).length,
    }))
    .filter(({ count }) => count > 1); //filter all count > 1
}

function initialPaint() {
  currentDuplicatedDecorations.forEach((decoration) => {
    decoration.dispose();
  });
}

function paintDuplicatedValues(currentDuplicatedValues: Row[]) {
  currentDuplicatedValues.forEach((line) => {
    const currentIndex = line.index + 1;

    const decorationOptions: vscode.DecorationOptions[] = [
      {
        range: new vscode.Range(
          currentIndex,
          vscode.window.activeTextEditor?.document
            .lineAt(currentIndex)
            .text.indexOf('"') ?? 0,
          currentIndex,
          vscode.window.activeTextEditor?.document.lineAt(currentIndex).text
            .length || 0
        ),
        hoverMessage: "Duplicate object value",
      },
    ];

    const decorationType = vscode.window.createTextEditorDecorationType({
      overviewRulerColor: "red",
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      light: {
        outline: "1px solid red",
      },
      dark: {
        outline: "1px solid red",
      },
    });

    vscode.window.activeTextEditor?.setDecorations(
      decorationType,
      decorationOptions
    );

    currentDuplicatedDecorations.push(decorationType);
  });
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "jasonlint",
    () => {
      if (vscode.window.activeTextEditor?.document.languageId === "json") {
        const json = vscode.window.activeTextEditor?.document.getText();

        if (json) {
          const parsed = JSON.parse(json);

          const duplicatedValues = getDuplicatedValues(Object.values(parsed));

          initialPaint();

          if (duplicatedValues.length > 0) {
            if (!alertShowed) {
              vscode.window.showErrorMessage(
                "JASON Lint: Duplicated values detected."
              );

              alertShowed = true;
            }

            paintDuplicatedValues(duplicatedValues);
          }
        }
      }
    }
  );

  vscode.commands.executeCommand("jasonlint");

  vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("jasonlint");
  });

  vscode.workspace.onDidChangeTextDocument(() => {
    vscode.commands.executeCommand("jasonlint");
  });

  vscode.workspace.onDidCreateFiles(() => {
    vscode.commands.executeCommand("jasonlint");
  });

  vscode.workspace.onDidRenameFiles(() => {
    vscode.commands.executeCommand("jasonlint");
  });

  vscode.window.onDidChangeActiveTextEditor(() => {
    vscode.commands.executeCommand("jasonlint");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
