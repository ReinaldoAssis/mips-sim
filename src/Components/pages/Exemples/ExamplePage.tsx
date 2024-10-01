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
            SharedData.instance.programTitle = text;
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

    return <div style={{height:"110vh"}}>

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

        <GridItem w="100%" h='100'>
            {
                example("Approximation of PI", `j main


#@return
fdiv_r:
    jr $ra

#@loop
fdiv_l:
    div $a0 $a1
    mfhi $v0
    #addi $v0 $v0 48				# converte para ascii
    call 3						# print
    mflo $t0					# t0 = resto
    beq $t0 $zero fdiv_r		# se não houver mais resto
    addi $t1 $zero 10			# vamos usar para multiplicar por 10
    mult $t0 $t1				# mult. resto por 10
    mflo $a0					# a0 recebe resto x 10
    addi $a2 $a2 -1
    beq $a2 $zero fdiv_r
    j fdiv_l


fdiv:
    div $a0 $a1
    mfhi $v0				
    mflo $a0				
    call 3					
    addi $v0 $zero 46 		
    call 2 					
    addi $t1 $zero 10		
    mult $a0 $t1
    mflo $a0
    j fdiv_l


pi_invalid:
    jr $ra


pi_sub:
    beq $t5 $zero pi_invalid #recusa se for par
    addi $t6 $zero 4
    sll $t6 $t6 14
    div $t6 $t0 #4<<shamt / d
    mfhi $t6
    sub $v0 $v0 $t6 #sum -= 4<<shamt / d
    jr $ra

pi_sum:
    bne $t5 $zero pi_invalid #recusa se for impar
    addi $t6 $zero 4
    sll $t6 $t6 14
    div $t6 $t0 #4<<shamt / d
    mfhi $t6
    add $v0 $v0 $t6 #sum += 4<<shamt / d
    jr $ra

pi_l:
    addi $t5 $zero 1
    and $t5 $t3 $t5 #contador mod 2
    jal pi_sum
    jal pi_sub
    addi $t0 $t0 2 #d+=2
    beq $a0 $t3 pi_r
    addi $t3 $t3 1 #incrementa contador
    j pi_l

pi_r:
    #call 1
    lw $ra 0($zero)
    jr $ra

#a0 numero de iterações
#a1 shamt
pi:
    sw $ra 0($zero) #salva ra
    addi $v0 $zero 0 #sum
    addi $t0 $zero 1 #d
    addi $t3 $zero 0 #inicia contador
    j pi_l

print_label:
    push $v0
    addi $v0 $zero 65
    call 2
    addi $v0 $zero 112
    call 2
    addi $v0 $zero 112
    call 2
    addi $v0 $zero 114
    call 2
    addi $v0 $zero 111
    call 2
    addi $v0 $zero 120
    call 2
    addi $v0 $zero 105
    call 2
    addi $v0 $zero 109
    call 2
    addi $v0 $zero 97
    call 2
    addi $v0 $zero 116
    call 2
    addi $v0 $zero 105
    call 2
    addi $v0 $zero 111
    call 2
    addi $v0 $zero 110
    call 2
    addi $v0 $zero 32
    call 2
    addi $v0 $zero 111
    call 2
    addi $v0 $zero 102
    call 2
    addi $v0 $zero 32
    call 2
    addi $v0 $zero 80
    call 2
    addi $v0 $zero 73
    call 2
    addi $v0 $zero 32
    call 2
    addi $v0 $zero 117
    call 2
    addi $v0 $zero 115
    call 2
    addi $v0 $zero 105
    call 2
    addi $v0 $zero 110
    call 2
    addi $v0 $zero 103
    call 2
    addi $v0 $zero 32
    call 2
    addi $v0 $zero 105
    call 2
    addi $v0 $zero 110
    call 2
    addi $v0 $zero 116
    call 2
    addi $v0 $zero 101
    call 2
    addi $v0 $zero 103
    call 2
    addi $v0 $zero 101
    call 2
    addi $v0 $zero 114
    call 2
    addi $v0 $zero 32
    call 2
    addi $v0 $zero 109
    call 2
    addi $v0 $zero 97
    call 2
    addi $v0 $zero 116
    call 2
    addi $v0 $zero 104
    call 2
    addi $v0 $zero 58
    call 2
    addi $v0 $zero 32
    call 2
    pop $v0
    jr $ra
    
main:
    addi $a0 $zero 200
    addi $a1 $zero 14
    jal pi
    addi $a0 $v0 0
    addi $a1 $zero 16384
    addi $a2 $zero 10
    jal print_label
    jal fdiv
    call 1
    call 0`, 16)
            }
        </GridItem>
        
        <GridItem w='100%' h='100'>
        {example("3D Graphics",`# ---------------
# Project by Reinaldo M. Assis
# Started on: 09-02-24
# Finished on: 21-02-24
# ---------------

# ---------------
# 4 - PI32t
# 8 - RAD
# 12 - ONE
# $s0 coords x
# $s1 coords y
# $s2 coords z

j main

setup:
    addi $t0 $zero 29412        # we only have 16 bits for imm, but it's signed so in reality
    sll $t0 $t0 3               # we only have 15 bits to work with
    addi $t0 $t0 -29409         # so we have to use this operations to get to the value we wanted
    sw $t0 4($zero)             # PI32t

    addi $t0 $zero 1144         # RAD
    sw $t0 8($zero)

    addi $t0 $zero 1            # 1 << 16
    sll $t0 $t0 16
    sw $t0 12($zero) 

    addi $s0 $zero 100          # pointer to array of x
    addi $s1 $zero 280          # pointer to array of y
    addi $s2 $zero 460          # pointer to array of z

    jr $ra

# int32_t @a0
# int32_t @return v0
taylor:
    addi $t0 $a0 0 # t0 will be our x but >> 4
    srl $t0 $t0 4

    mult $t0 $t0
    mflo $t1        # x2
    srl $t1 $t1 8

    addi $t2 $t1 $zero
    srl $t2 $t2 4   # x2 >> 4

    mult $t2 $t0    # x2 * x
    mflo $t0
    srl $t0 $t0 8   # t0 = x3

    addi $t1 $t0 0 
    srl $t1 $t1 4   # t1 = x3>>4

    mult $t1 $t2
    mflo $t3
    srl $t3 $t3 8   # t3 = x5

    addi $t6 $zero 6
    div $t0 $t6
    mfhi $t0
    sub $v0 $a0 $t0 # x - x3/6

    addi $t6 $zero 120
    div $t3 $t6
    mfhi $t3

    add $v0 $v0 $t3
    jr $ra

# int32_t fxd x : @a0 (degrees)
# int32_t fxd @return : $v0
sin:
    push $a0
    # ---- x mod 360 ----
    # !! here im using the div instruction because this is running
    # !! on a simulator, but in a real device we would try to optimize
    # !! this to not use the div instruction.
    addi $t0 $zero 360
    lw $t1 12($zero)        # ONE
    mult $t0 $t1
    mflo $t0                # 360 in fxd

    div $a0 $t0
    mflo $a0

    lw $t0 4($zero)         # loads PI32_t

    # --- PI32_t : $t0 

    addi $t1 $t0 0 
    srl $t1 $t1 6

    # --- PI32_t >> 6 : $t1

    addi $t2 $a0 0
    srl $t2 $t2 6

    # --- x >> 6 : $t2

    addi $t3 $zero 180      # $t3 = 180
    mult $t1 $t2            # (PI32_t >> 6) * (x >> 6)
    mflo $t1
    div $t1 $t3
    mfhi $t1
    srl $a0 $t1 4

    # --- [(PI32_t >> 6) * (x >> 6)/180] >> 4 : $a0 [x]

    addi $t2 $zero 1
    sll $t2 $t2 25
    div $t2 $t0
    mfhi $t2
    sll $t2 $t2 4

    # -- (2*(1<<24))/PI32_t << 4: $t2 [frac1]

    addi $t1 $a0 0
    srl $t1 $t1 4

    # -- x >> 4 : $t1

    mult $t1 $t2
    mflo $t1
    srl $t1 $t1 24

    # -- ((x >> 4) * (frac1 >> 4)) >> 24 : $t1 [k] // quadrante

    addi $t2 $t0 0
    srl $t2 $t2 1

    # -- PI32_t / 2 : $t2 [frac2]

    mult $t1 $t2        # k*frac2
    mflo $t3

    sub $a0 $a0 $t3     # x - k*frac2 

    # -- x - k*frac2 : $a0 [y]

    beq $t1 $zero taylor0       # case k = 0

    addi $t3 $zero 2
    beq $t1 $t3 taylor1         # case k = 2 

    # --

    sub $a0 $t2 $a0             # frac2 - y

    addi $t3 $zero 1
    beq $t1 $t3 taylor0         # case k = 1 

    addi $t3 $zero 3
    beq $t1 $t3 taylor1         # case k = 3

    jr $ra

    taylor0:
        push $ra
        jal taylor
        pop $ra
        pop $a0
        jr $ra

    taylor1:
        push $ra
        jal taylor
        pop $ra
        addi $t0 $zero -1
        mult $v0 $t0
        mflo $v0
        pop $a0
        jr $ra


# pointer int[3] center : $a0
# int size : $a1
# return : $s0 (array of x), $s1 (array of y), $s2 (array of z)
generateCubePoints:
    addi $t0 $zero 28            # index for array of points

    # -- generating array of unit vertices
    addi $t1 $zero -1
    addi $t2 $zero 1
    sw $t1 0($s0)
    sw $t1 0($s1)
    sw $t1 0($s2)

    sw $t2 4($s0)
    sw $t1 4($s1)
    sw $t1 4($s2)

    sw $t2 8($s0)
    sw $t2 8($s1)
    sw $t1 8($s2)

    sw $t1 12($s0)
    sw $t2 12($s1)
    sw $t1 12($s2)

    sw $t1 16($s0)
    sw $t1 16($s1)
    sw $t2 16($s2)

    sw $t2 20($s0)
    sw $t1 20($s1)
    sw $t2 20($s2)

    sw $t2 24($s0)
    sw $t2 24($s1)
    sw $t2 24($s2)

    sw $t1 28($s0)
    sw $t2 28($s1)
    sw $t2 28($s2)


    itarate_points:
        add $t1 $t0 $s0                 # x[i]
        add $t2 $t0 $s1                 # y[i]
        add $t4 $t0 $s2                 # z[i]

        lw $t3 0($t1)                   # x[i]

        mult $a1 $t3                    # x[i] * size
        mflo $t3

        # -- x[i] * size : $t3

        lw $t5 0($a0)                   # load center x
        add $t3 $t3 $t5                 # center_x + x[i]*size
        sw $t3 0($t1)                   # x[i] = center_x + x[i]*size

        # -------

        lw $t3 0($t2)                   # y[i]

        mult $a1 $t3                    # y[i] * size
        mflo $t3

        # -- y[i] * size : $t3

        lw $t5 4($a0)                   # load center y
        add $t3 $t3 $t5                 # center_y + y[i]*size
        sw $t3 0($t2)                   # y[i] = center_y + y[i]*size

        # -------

        lw $t3 0($t4)                   # z[i]

        mult $a1 $t3                    # z[i] * size
        mflo $t3

        # -- z[i] * size : $t3

        lw $t5 8($a0)                   # load center z
        add $t3 $t3 $t5                 # center_z + z[i]*size
        sw $t3 0($t4)                   # z[i] = center_y + y[i]*size

        beq $t0 $zero generateCubePoints_r
        addi $t0 $t0 -4
        j itarate_points

    generateCubePoints_r:
        jr $ra


# int[2] a,b : pointer a0
# return abs(a-b)
# t0, t1
abs:
    lw $t0 0($a0)
    lw $t1 4($a0)
    sub $t0 $t0 $t1
    slt $t1 $zero $t0
    beq $t1 $zero abs_neg
    add $v0 $zero $t0
    jr $ra

    abs_neg:
        sub $v0 $zero $t0
        jr $ra


# int[2] x1,y1 : pointer @a0
# int[2] x2,y2 : pointer @a1
# hex line color : @a2
line:
    push $s0                # dx
    push $s1                # dy
    push $s2                # sx
    push $s3                # sy
    push $s4                # err
    push $s5                # e2
    # push $s6

    lw $t0 0($a0)           # x1
    lw $t1 0($a1)           # x2
    push $a0
    addi $a0 $zero 900
    sw $t0 0($a0)
    sw $t1 4($a0)

    push $ra
    jal abs
    pop $ra
    addi $s0 $v0 0

    pop $a0

    # -- abs(x2-x1) : $s0

    lw $t0 4($a0)           # y1
    lw $t1 4($a1)           # y2
    push $a0
    addi $a0 $zero 900
    sw $t0 0($a0)
    sw $t1 4($a0)

    push $ra
    jal abs
    pop $ra
    addi $s1 $v0 0

    pop $a0

    # -- abs(y2-y1) : $s1
    
    # -- sx = x1 < x2 ? 1 : -1
    lw $t0 0($a0)
    lw $t1 0($a1)
    slt $s2 $t0 $t1
    beq $s2 $zero sxneg
    j line_c1

    sxneg:
        addi $s2 $zero -1

    line_c1:
    # -- sy = y1 < y2 ? 1 : -1
    lw $t0 4($a0)
    lw $t1 4($a1)
    slt $s3 $t0 $t1
    beq $s3 $zero syneg
    j line_c2

    syneg:
        addi $s3 $zero -1
    
    line_c2:
    sub $s4 $s0 $s1         # err = dx - dy

    line_while:

        # ---- inside the while ----

        lw $t0 4($a0)           # y1
        addi $t1 $zero 100
        mult $t1 $t0
        mflo $t0
        lw $t1 0($a0)           # x1
        add $t0 $t0 $t1         # x+100*y
        addi $t0 $t0 2000
        sw $a2 0($t0)           # write pixel

        sll $s5 $s4 1           # e2 = err*2
        sub $t0 $zero $s1       # t0 = -dy

        slt $t0 $t0 $s5         # if -dy < e2
        bne $t0 $zero line_if1
        j line_c3

        line_if1:
            sub $s4 $s4 $s1     # err -= dy
            lw $t0 0($a0)
            add $t0 $t0 $s2      # x1 += sx
            sw $t0 0($a0)

        line_c3:
        slt $t0 $s5 $s0         # if e2 < dx
        bne $t0 $zero line_if2
        j line_c4

        line_if2:
            add $s4 $s4 $s0     # err += dx
            lw $t0 4($a0)
            add $t0 $t0 $s3      # y1 += sy
            sw $t0 4($a0)

        line_c4:

        lw $t0 0($a0)           # x1
        lw $t1 0($a1)           # x2
        sub $t2 $t0 $t1
        bne $t2 $zero line_while

        lw $t0 4($a0)           # y1
        lw $t1 4($a1)           # y2
        sub $t3 $t0 $t1
        bne $t3 $zero line_while

        j line_done

    line_done:
        pop $s5
        pop $s4
        pop $s3
        pop $s2
        pop $s1
        pop $s0
        # call 40
        jr $ra


# does not need any arguments
# uses $s0 to get the points of the cube
# $s1 and $s2 are not really needed and could be refactored
drawcube:
    addi $t0 $zero 3

    drawcube_l:
        addi $t1 $t0 1              # j = i + 1
        addi $t2 $zero 3
        and $t1 $t1 $t2             # j = (i+1) % 4

        addi $t2 $t0 4              # k = i + 4
        addi $t3 $t1 4              # l = (i+1) % 4 + 4

        sll $t4 $t0 2               # multiplies i * 4 
        add $t4 $t4 $s0             # points[i]

        lw $t5 0($t4)               # points[i][0]
        addi $t4 $t4 180            # s0, s1 and s2 are separeted by 180
        lw $t6 0($t4)               # points[i][1] 

        addi $a0 $zero 500
        sw $t5 0($a0)               # x1
        sw $t6 4($a0)               # y1

        sll $t4 $t1 2               # multiplies j * 4 
        add $t4 $t4 $s0             # points[j]
        
        lw $t5 0($t4)
        addi $t4 $t4 180
        lw $t6 0($t4)

        addi $a1 $zero 508
        sw $t5 0($a1)               # x2 
        sw $t6 4($a1)               # y2

        # -- debug -----
        # lw $v0 0($a0)
        # call 1
        # lw $v0 4($a0)
        # call 1
        # lw $v0 0($a1)
        # call 1
        # lw $v0 4($a1)
        # call 1
        # addi $a2 $zero 0
        # -----------------

        push $t0
        push $t1
        push $t2
        push $t3
        push $ra
        jal line
        pop $ra
        pop $t3
        pop $t2
        pop $t1
        pop $t0

        sll $t4 $t2 2               # multiplies k * 4 
        add $t4 $t4 $s0             # points[k]

        lw $t5 0($t4)               # points[k][0]
        addi $t4 $t4 180            # s0, s1 and s2 are separeted by 180
        lw $t6 0($t4)               # points[k][1] 

        addi $a0 $zero 500
        sw $t5 0($a0)               # x1
        sw $t6 4($a0)               # y1

        sll $t4 $t3 2               # multiplies l * 4 
        add $t4 $t4 $s0             # points[l]
        
        lw $t5 0($t4)
        addi $t4 $t4 180
        lw $t6 0($t4)

        addi $a1 $zero 508
        sw $t5 0($a1)               # x2 
        sw $t6 4($a1)               # y2

        push $t0
        push $t1
        push $t2
        push $t3
        push $ra
        jal line
        pop $ra
        pop $t3
        pop $t2
        pop $t1
        pop $t0

        sll $t4 $t0 2               # multiplies i * 4 
        add $t4 $t4 $s0             # points[i]

        lw $t5 0($t4)               # points[i][0]
        addi $t4 $t4 180            # s0, s1 and s2 are separeted by 180
        lw $t6 0($t4)               # points[i][1] 

        addi $a0 $zero 500
        sw $t5 0($a0)               # x1
        sw $t6 4($a0)               # y1

        sll $t4 $t2 2               # multiplies k * 4 
        add $t4 $t4 $s0             # points[k]
        
        lw $t5 0($t4)
        addi $t4 $t4 180
        lw $t6 0($t4)

        addi $a1 $zero 508
        sw $t5 0($a1)               # x2 
        sw $t6 4($a1)               # y2

        push $t0
        push $ra
        jal line
        pop $ra
        pop $t0

        beq $t0 $zero drawcube_r
        addi $t0 $t0 -1
        j drawcube_l

    drawcube_r:
        jr $ra


# @a0 : pointer int[3] position
# @a1 : angle of rotation (in degrees)
rotateZ:
    push $a0

    lw $t0 12($zero)            # ONE
    mult $t0 $a1
    mflo $a0                    # int32_t fixed angle

    
    push $ra
    jal sin
    pop $ra
    addi $v1 $v0 0              # sin(x) -> $v1

    lw $t0 12($zero)            # ONE

    addi $t2 $zero 90
    mult $t2 $t0
    mflo $t2                    # 90 in fxd

    add $a0 $a0 $t2             # angle + 90

    push $ra
    jal sin
    pop $ra
    pop $a0


    # -- $v0 with cos(x) and $v1 with sin(x)
    lw $t0 12($zero)            # ONE
    addi $t1 $zero 7
    rotz_l:
        
        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s0         # pointer *points[i][0] 
        addi $t3 $t2 180        # pointer *points[i][1] 

        lw $t2 0($t2)           # value points[i][0]
        lw $t3 0($t3)           # value points[i][1]

        lw $t4 0($a0)           # pos[0]
        lw $t5 4($a0)           # pos[1]

        sub $t2 $t2 $t4         # points[i][0] - pos[0], x
        sub $t3 $t3 $t5         # points[i][1] - pos[1], y

        mult $t2 $v0            # x * cosA
        mflo $t4
        mult $t3 $v1            # y * sinA
        mflo $t5

        sub $t4 $t4 $t5         # xcos - ysin
        srl $t4 $t4 16          # >> 16, nx

        mult $t2 $v1            # x * sinA
        mflo $t5
        mult $t3 $v0            # y * cosA
        mflo $t6

        add $t5 $t5 $t6         # ysin + xcos
        srl $t5 $t5 16          # >> 16, ny

        lw $t2 0($a0)
        lw $t3 4($a0)

        add $t4 $t4 $t2         # nx + pos[0]
        add $t5 $t5 $t3         # ny + pos[1]

        # -- debug -----
        # call 1
        # push $v0
        # addi $v0 $v1 0
        # call 1
        # addi $v0 $t1 0
        # call 1
        # addi $v0 $t4 0
        # call 1
        # addi $v0 $t5 0
        # call 1 
        # pop $v0
        # ------------

        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s0         # pointer *points[i][0] 
        addi $t3 $t2 180        # pointer *points[i][1] 

        sw $t4 0($t2)
        sw $t5 0($t3)

        beq $t1 $zero rotz_r
        addi $t1 $t1 -1
        j rotz_l

    rotz_r:
        jr $ra

# @a0 : pointer int[3] position
# @a1 : angle of rotation (in degrees)
rotateX:
    push $a0

    lw $t0 12($zero)            # ONE
    mult $t0 $a1
    mflo $a0                    # int32_t fixed angle

    
    push $ra
    jal sin
    pop $ra
    addi $v1 $v0 0              # sin(x) -> $v1

    lw $t0 12($zero)            # ONE

    addi $t2 $zero 90
    mult $t2 $t0
    mflo $t2                    # 90 in fxd

    add $a0 $a0 $t2             # angle + 90

    push $ra
    jal sin
    pop $ra
    pop $a0


    # -- $v0 with cos(x) and $v1 with sin(x)
    lw $t0 12($zero)            # ONE
    addi $t1 $zero 7
    rotx_l:
        
        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s1         # pointer *points[i][1] 
        addi $t3 $t2 180        # pointer *points[i][2] 

        lw $t2 0($t2)           # value points[i][1]
        lw $t3 0($t3)           # value points[i][2]

        lw $t4 4($a0)           # pos[1]
        lw $t5 8($a0)           # pos[2]

        sub $t2 $t2 $t4         # points[i][1] - pos[1], y
        sub $t3 $t3 $t5         # points[i][2] - pos[2], z

        mult $t2 $v0            # y * cosA
        mflo $t4
        mult $t3 $v1            # z * sinA
        mflo $t5

        sub $t4 $t4 $t5         # ycos - zsin
        srl $t4 $t4 16          # >> 16, ny

        mult $t2 $v1            # y * sinA
        mflo $t5
        mult $t3 $v0            # z * cosA
        mflo $t6

        add $t5 $t5 $t6         # ysin + zcos
        srl $t5 $t5 16          # >> 16, nz

        lw $t2 4($a0)
        lw $t3 8($a0)

        add $t4 $t4 $t2         # ny + pos[1]
        add $t5 $t5 $t3         # nz + pos[2]

        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s1         # pointer *points[i][1] 
        addi $t3 $t2 180        # pointer *points[i][2] 

        sw $t4 0($t2)
        sw $t5 0($t3)

        beq $t1 $zero rotx_r
        addi $t1 $t1 -1
        j rotx_l

    rotx_r:
        jr $ra

# @a0 : pointer int[3] position
# @a1 : angle of rotation (in degrees)
rotateY:
    push $a0

    lw $t0 12($zero)            # ONE
    mult $t0 $a1
    mflo $a0                    # int32_t fixed angle

    
    push $ra
    jal sin
    pop $ra
    addi $v1 $v0 0              # sin(x) -> $v1

    lw $t0 12($zero)            # ONE

    addi $t2 $zero 90
    mult $t2 $t0
    mflo $t2                    # 90 in fxd

    add $a0 $a0 $t2             # angle + 90

    push $ra
    jal sin
    pop $ra
    pop $a0


    # -- $v0 with cos(x) and $v1 with sin(x)
    lw $t0 12($zero)            # ONE
    addi $t1 $zero 7
    roty_l:
        
        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s0         # pointer *points[i][0] 
        addi $t3 $t2 360        # pointer *points[i][2] 

        lw $t2 0($t2)           # value points[i][0]
        lw $t3 0($t3)           # value points[i][2]

        lw $t4 0($a0)           # pos[0]
        lw $t5 8($a0)           # pos[2]

        sub $t2 $t2 $t4         # points[i][0] - pos[0], x
        sub $t3 $t3 $t5         # points[i][2] - pos[2], z

        mult $t2 $v0            # x * cosA
        mflo $t4
        mult $t3 $v1            # z * sinA
        mflo $t5

        sub $t4 $t4 $t5         # xcos - zsin
        srl $t4 $t4 16          # >> 16, nx

        mult $t2 $v1            # x * sinA
        mflo $t5
        mult $t3 $v0            # y * cosA
        mflo $t6

        add $t5 $t5 $t6         # xsin + zcos
        srl $t5 $t5 16          # >> 16, ny

        lw $t2 0($a0)
        lw $t3 8($a0)

        add $t4 $t4 $t2         # nx + pos[0]
        add $t5 $t5 $t3         # nz + pos[2]

        sll $t2 $t1 2           # i * 4
        add $t2 $t2 $s0         # pointer *points[i][0] 
        addi $t3 $t2 360        # pointer *points[i][2] 

        sw $t4 0($t2)
        sw $t5 0($t3)

        beq $t1 $zero roty_r
        addi $t1 $t1 -1
        j roty_l

    roty_r:
        jr $ra

text:
    addi $t0 $a2 0
    sw $t0 11210($zero)
    sw $t0 11211($zero)
    sw $t0 11212($zero)
    sw $t0 11312($zero)
    sw $t0 11412($zero)
    sw $t0 11411($zero)
    sw $t0 11512($zero)
    sw $t0 11612($zero)
    sw $t0 11611($zero)
    sw $t0 11610($zero)

    sw $t0 11214($zero)
    sw $t0 11314($zero)
    sw $t0 11414($zero)
    sw $t0 11514($zero)
    sw $t0 11614($zero)
    sw $t0 11215($zero)
    sw $t0 11316($zero)
    sw $t0 11416($zero)
    sw $t0 11516($zero)
    sw $t0 11615($zero)

    sw $t0 11220($zero)
    sw $t0 11221($zero)
    sw $t0 11222($zero)
    sw $t0 11223($zero)
    sw $t0 11320($zero)
    sw $t0 11420($zero)
    sw $t0 11520($zero)
    sw $t0 11620($zero)
    sw $t0 11621($zero)
    sw $t0 11622($zero)
    sw $t0 11623($zero)
    sw $t0 11523($zero)
    sw $t0 11423($zero)
    sw $t0 11422($zero)

    sw $t0 11225($zero)
    sw $t0 11325($zero)
    sw $t0 11425($zero)
    sw $t0 11525($zero)
    sw $t0 11625($zero)
    sw $t0 11226($zero)
    sw $t0 11227($zero)
    sw $t0 11327($zero)
    sw $t0 11426($zero)
    sw $t0 11527($zero)
    sw $t0 11627($zero)

    sw $t0 11229($zero)
    sw $t0 11329($zero)
    sw $t0 11429($zero)
    sw $t0 11529($zero)
    sw $t0 11629($zero)
    sw $t0 11230($zero)
    sw $t0 11231($zero)
    sw $t0 11331($zero)
    sw $t0 11431($zero)
    sw $t0 11531($zero)
    sw $t0 11631($zero)
    sw $t0 11430($zero)

    sw $t0 11233($zero)
    sw $t0 11333($zero)
    sw $t0 11433($zero)
    sw $t0 11533($zero)
    sw $t0 11633($zero)
    sw $t0 11234($zero)
    sw $t0 11235($zero)
    sw $t0 11335($zero)
    sw $t0 11435($zero)
    sw $t0 11434($zero)

    sw $t0 11237($zero)
    sw $t0 11337($zero)
    sw $t0 11437($zero)
    sw $t0 11537($zero)
    sw $t0 11637($zero)
    sw $t0 11438($zero)
    sw $t0 11439($zero)
    sw $t0 11539($zero)
    sw $t0 11639($zero)
    sw $t0 11239($zero)
    sw $t0 11339($zero)

    sw $t0 11241($zero)
    sw $t0 11441($zero)
    sw $t0 11541($zero)
    sw $t0 11641($zero)

    sw $t0 11243($zero)
    sw $t0 11343($zero)
    sw $t0 11443($zero)
    sw $t0 11543($zero)
    sw $t0 11643($zero)
    sw $t0 11244($zero)
    sw $t0 11245($zero)
    sw $t0 11644($zero)
    sw $t0 11645($zero)

    sw $t0 11247($zero)
    sw $t0 11248($zero)
    sw $t0 11249($zero)
    sw $t0 11347($zero)
    sw $t0 11447($zero)
    sw $t0 11448($zero)
    sw $t0 11449($zero)
    sw $t0 11549($zero)
    sw $t0 11649($zero)
    sw $t0 11648($zero)
    sw $t0 11647($zero)

    call 40
    jr $ra

clr_screen:
    # addi $t0 $zero 2200
    # addi $t1 $zero 10060
    addi $t0 $zero 2000
    addi $t1 $zero 12000
    addi $t3 $zero 0xffff

    clr_l:
        sw $t3 0($t0)
        beq $t0 $t1 clr_d
        addi $t0 $t0 1
        j clr_l

    clr_d:
        call 40
        jr $ra

main:
    jal setup
    jal clr_screen

    addi $a2 $zero 0xf80f
    jal text
    
    addi $s5 $zero 360
    main_loop:
    
        addi $a0 $zero 500      # pointer
        addi $t0 $zero 47       # x
        addi $t1 $zero 50       # y
        sw $t0 0($a0)
        sw $t1 4($a0)
        sw $zero 8($a0)         # z

        addi $a1 $zero 20       # size
        push $a0
        jal generateCubePoints
        pop $a0

        add $a1 $zero $s5
        jal rotateX
        sll $a1 $a1 2
        jal rotateY
        srl $a1 $a1 3
        jal rotateZ
        
        # drawing cube
        addi $a2 $zero 0xf80f
        jal drawcube
        call 40

        # erasing cube
        addi $a2 $zero 0xffff
        jal drawcube
        # call 40

        beq $s5 $zero done
        addi $s5 $s5 -1
        j main_loop


done:
    call 0
`,16)}
        
        </GridItem>

    </Grid>
    </div>
}