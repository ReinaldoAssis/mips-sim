import AssemblyEditor from "../../../../AssemblyEditor";

export default function SingleWindow ()
  {
    return (
      <>
      {/* <Input placeholder="Recent" variant={"filled"} onChange={(e) => { */}

      {/* }} /> */}
      <AssemblyEditor onEditorChange={() => {}} />
      {/* <EditorView onEditorChange={onEditorChange} assembleBtn={assembleCode} runBtn={runCode} callExecuteStep={callExecuteStep} /> */}
      </>
    )
  }