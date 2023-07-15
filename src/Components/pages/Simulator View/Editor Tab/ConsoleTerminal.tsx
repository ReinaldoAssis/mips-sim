import { Icon, Textarea } from "@chakra-ui/react";
import React from "react";
import { MdDelete } from "react-icons/md";
import Logger from "../../../../Service/Logger";

export default function ConsoleTerminal(props: {
  value: string;
  onClear: Function;
}) {
  return (
    <>
      <Icon
        as={MdDelete}
        onClick={() => {
          Logger.instance.clearConsole();
          props.onClear();
        }}
        style={{
          position: "relative",
          left: "95%",
          scale: "1.5",
          zIndex: 10,
        }}
      />
      <Textarea
        readOnly={true}
        border={"hidden"}
        placeholder={"Empty"}
        value={props.value}
        height={"150px"}
        style={{ position: "relative", bottom: 50, userSelect: "text" }}
        id={"consoleTxtArea"}
        scrollBehavior={"smooth"}
      ></Textarea>
    </>
  );
}
