import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/indent-fold";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/mode/javascript/javascript";
import "pseudo-worker/polyfill";
import * as React from "react";
import * as CodeMirror from "react-codemirror";
import { RpcProvider } from "worker-rpc";

import "./App.css";
import "./App.worker";
import { code } from "./code";
import "./json-source-map";

class App extends React.Component {
    private editorRef: any;
    private rpcProvider: any;

    constructor(props: any) {
        super(props);
        this.editorRef = React.createRef();
        const worker = new Worker("App.worker.js");
        this.rpcProvider = new RpcProvider((message, transfer) => worker.postMessage(message, transfer));
        worker.onmessage = e => this.rpcProvider.dispatch(e.data);
    }

    public async autoFold(cm: any) {
        // Use a Web Worker to get the source map for the JSON document
        const sourceMap = await this.rpcProvider.rpc("generateSourceMap", {
            obj: code
        });
        cm.setValue(sourceMap.json);
        for (const keyPath in sourceMap.pointers) {
            // Collapse everything except the first result.
            if (["", "/results", "/results/0"].indexOf(keyPath) === -1) {
                cm.foldCode(
                    {
                        ch: 0,
                        line: sourceMap.pointers[keyPath].value.line
                    },
                    null,
                    "fold"
                );
            }
        }
    }

    public componentDidMount() {
        const cm = this.editorRef.current.getCodeMirror();
        cm.setSize(800, 600);
        this.autoFold(cm);
    }

    public render() {
        const codeMirrorOptions = {
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            lineNumbers: true
        };
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">codemirror custom json folding</h1>
                </header>
                <section className="App-editor">
                    <CodeMirror ref={this.editorRef} options={codeMirrorOptions} />
                </section>
            </div>
        );
    }
}

export default App;
