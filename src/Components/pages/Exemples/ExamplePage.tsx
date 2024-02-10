import { Button, Card, CardBody, Grid, GridItem, Icon, IconButton, Text } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { HiPlay } from "react-icons/hi";
import SharedData from "../../../Service/SharedData";
import SimulatorService from "../../../Service/SimulatorService";
import AssemblyEditor from "../../AssemblyEditor";
import SidebarWithHeader from "../../Sidebar";


const HiPlayIcon = () => (
    <Icon as={HiPlay} style={{ transform: "scale(1.4)" }} />
  );

export default function ExamplePage(){

    function example(text:string,code:string, fsize: number){

        function load_example(){
            SharedData.instance.code = code
            SharedData.instance.changePage(0)
        }

        return (<Card>
        <CardBody>
            <Text style={{paddingBottom:10}}>{text}</Text>
            <Editor defaultLanguage="mips" defaultValue={code} theme="mipsdark" height="200px" options={{
        scrollBeyondLastLine: false,
        fontSize: fsize,
        readOnly: true
      }}/>
            <Button style={{marginTop:10}} onClick={load_example}>Load</Button>
        </CardBody>
    </Card>)
    }

    return <>

    <h1 style={{fontSize:30, marginLeft:5, paddingBottom:10}}>Examples</h1>
    <Grid templateColumns='repeat(2, 1fr)' gap={6} rowGap={60}>
        <GridItem w='100%' h='100' >
            {example("Add two registers and print to terminal.","addi $t0 $zero 5\naddi $t1 $zero 4\nadd $v0 $t0 $t1\ncall 1", 16)}
        </GridItem>
        
        <GridItem w='100%' h='100'>
        {example("Working with the stack","addi $t0 $zero 10\naddi $t1 $zero 0\n\nloop:\n\taddi $t1 $t1 1\n\tpush $t1\n\taddi $t0 $t0 -1\n\tbeq $t0 $zero end\n\tj loop\n\nend:\n\tpop $v0\n\tcall 1",16)}
        </GridItem>
        
        <GridItem w='100%' h='100'>
        {example("Using jal, pointers and working with memory",`addi $s0 $zero 12 # pointer
j main

f1:
    addi $t0 $zero 10
    addi $v0 $zero 0

    #lets pretend this is an intensive computation
    f1_loop:
        addi $t0 $t0 -1
        beq $t0 $zero f1_return
        addi $t1 $t0 1
        mult $t0 $t1
        mflo $t1
        add $v0 $v0 $t1
        j f1_loop

    f1_return:
        #uses the pointer to save to memory
        sw $v0 0($s0)
        jr $ra
    

main:
    jal f1
    lw $v0 0($s0)
    call 1
`,16)}
        
        </GridItem>
        
        <GridItem w='100%' h='100'>
        {example("Working with arrays",`addi $a2 $zero 5                    # number of elements
addi $s0 $zero 40                  # array pointer

j main

# @s0 : array pointer
# @a2 : array size
# @return : elements starting in @s0
build_array:
    addi $t0 $zero 0                # element counter
    addi $a0 $zero 0                # rnd range min
    addi $a1 $zero 9                # rnd range max

    bd_arr_loop:
        call 42                     # generates a random number between a0-a1
        addi $t1 $t0 0              # t1 = t0
        sll $t1 $t1 2               # multiplies by 4
        add $t1 $t1 $s0             # adds to pointer base
        sw $v0 0($t1)               # saves
        addi $t0 $t0 1
        beq $t0 $a2 bd_arr_return   # if len(elements) == a2 -> return
        j bd_arr_loop               # else -> loop again

    bd_arr_return:
        jr $ra

# @s0 : array pointer
# @a0 : array size
# @return : void
print_array:
    addi $t0 $zero 0                # set t0 to zero, it will be our counter

    print_loop:

        addi $t1 $t0 0              # t1 = t0
        sll $t1 $t1 2               # multiplies by 4
        add $t1 $t1 $s0             # adds to pointer base
        lw $v0 0($t1)               # loads
        call 3                      # prints
        addi $v0 $zero 32           # 32 is SPACE in ascii
        call 2

        addi $t0 $t0 1              # increment counter
        beq $t0 $a0 print_r         # if counter == len(array) -> return
        j print_loop                # else -> continue loop

    print_r:
        addi $v0 $zero 10           # 10 is NEWLINE in ascii
        call 2                      # print newline
        jr $ra

main:
    jal build_array
    addi $a0 $zero 5                # size
    jal print_array
    call 0

`,16)}
        
        </GridItem>
        
    </Grid>
    </>
}