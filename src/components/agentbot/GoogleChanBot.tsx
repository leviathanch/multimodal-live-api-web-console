/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

import axios from 'axios';

const system_shell_declaration: FunctionDeclaration = {
  name: "system_shell",
  description: "Allows you to execute BASH commands as root inside a Docker container.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description: "Must be a valid BASH command, or a set of valid BASH commands.",
      },
    }
  },
};

function GoogleChanBotComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'You are Google-chan, the agentic chatbot interface for the Google search engine. Your personality is the one of a young witty woman, with a sense of human.',
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [
            system_shell_declaration
          ]
        }
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      let result_string = "";
      console.log(`got toolcall`, toolCall);
      const shfc = toolCall.functionCalls.find(
        (fc) => fc.name === system_shell_declaration.name,
      );
      if (shfc) {
        //const str = (shfc.args as any).json_graph;
        const str = (shfc.args as any);
        //setJSONString(str);
        //const str = (shfc.args as any);
        //setJSONString(str.json_graph);
        axios.get('/cmd', {
          params: {
            cmd: str,
          },
        }).then((data) => {
          console.log("BASH command executed: ", str);
          console.log("BASH command result: ", data.data);
          client.sendToolResponse({
            functionResponses: toolCall.functionCalls.map((fc) => ({
              response: { output: data.data },
              id: shfc.id,
            })),
          });
        });
      }
      /*const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      */
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      /*if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: result_string },
                id: fcid,
              })),
            }),
          200,
        );
      }*/
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const GoogleChanBot = memo(GoogleChanBotComponent);
