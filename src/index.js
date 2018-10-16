import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { injectGlobal } from "styled-components";
import registerServiceWorker from "./registerServiceWorker";

injectGlobal`
    body,html {
        margin: 0;
        padding: 0;
        background: #000;
        font-family: Leto, Helvetica, sans-serif;
    }

    body {
        width: 100wh;
        color: #fff;
        background: white;
        background-size: 400% 400%;
        -webkit-animation: Gradient 15s ease infinite;
        -moz-animation: Gradient 15s ease infinite;
        animation: Gradient 15s ease infinite;
    }

    @-webkit-keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
        }
    }

    @-moz-keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
        }
    }

    @keyframes Gradient {
        0% {
            background-position: 0% 50%
        }
        50% {
            background-position: 100% 50%
        }
        100% {
            background-position: 0% 50%
	}
}

`;

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
