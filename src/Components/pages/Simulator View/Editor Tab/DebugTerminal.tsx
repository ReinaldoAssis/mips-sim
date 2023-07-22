import { Icon, Textarea } from "@chakra-ui/react";
import Logger from "../../../../Service/Logger";
import { MdDelete } from "react-icons/md";

export default function DebugTerminal(props: {
  value: string;
  onClear: Function;
}) {
  return (
    <>
      <Icon
        as={MdDelete}
        onClick={() => {
          Logger.instance.clearDebug();
          props.onClear();
        }}
        style={{
          position: "relative",
          left: "95%",
          top: 0,
          scale: "1.5",
          zIndex: 10,
        }}
      />
      <Textarea
        readOnly={true}
        userSelect={"text"}
        border={"hidden"}
        placeholder={"Empty"}
        value={props.value}
        height={"150px"}
        style={{ position: "relative", bottom: 50, userSelect: "text" }}
        id={"debugTxtArea"}
        scrollBehavior={"auto"}
      ></Textarea>
    </>
  );
}
