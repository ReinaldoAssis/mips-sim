![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)

**Escolha seu idioma**


<a target="_blank" href="https://github.com/ReinaldoAssis/mips-sim">
<img src="https://img.shields.io/badge/English%20-%20%231E90FF?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Ftree%2Fmaster" />
</a>

<a target="_blank" href="./README-br.md">
<img src="https://img.shields.io/badge/Brazilian%20Portuguese%20-%20%23228B22?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Fblob%2Fmaster%2FREADME-br.md"/>
</a>

<a target="_blank" href="./README-fr.md">
<img src="https://img.shields.io/badge/French%20-%20%23DC143C?style=flat-square&link=https%3A%2F%2Fgithub.com%2FReinaldoAssis%2Fmips-sim%2Fblob%2Fmaster%2FREADME-fr.md"/>
</a>


# WIMS (Web-based Interactive MIPS Simulator)

Um simulador baseado na arquitetura MIPS 32, idealizado para ajudar estudantes a aprender e explorar os fundamentos da linguagem de montagem e esquemas de circuitos.

## Recursos

- Editor de código integrado
- Execução e depuração passo a passo
- Saída de E/S (tela e teclado) [EM ANDAMENTO]
- Saída no terminal
- Visualização de esquemas [EM ANDAMENTO]

## Documentação

A documentação ainda está por ser feita, por enquanto, recomendo verificar as instruções de uso e ler a página do Conjunto de Instruções.

## Uso/Exemplos

Este é o código padrão quando você abre o editor pela primeira vez; ele calcula o enésimo número da sequência de Fibonacci. Você pode pressionar o botão verde para montar e executar, ou pode percorrer cada instrução usando o botão amarelo. O resultado é exibido no terminal.

```assembly
addi $t0, $zero, 0 #f1
addi $t1, $zero, 1 #f2
addi $a0, $zero, 15 #n
addi $a0, $a0, -1

fibonacci:
    addi $a0, $a0, -1
    add $t2, $t0, $t1 #soma
    add $t0, $zero, $t1 #f1 = f2
    add $t1, $zero, $t2 #f2 = soma
    beq $a0, $zero, main
    bne $a0, $zero, fibonacci

main:
    addi $v0, $t1, 0
    call 1



## Screenshots

Editor e terminal

![Editor and terminal](https://i.ibb.co/3RHngxw/image.png)

Conjunto de Instruções

![Instruction Set](https://i.ibb.co/PYVB0np/image.png)

## Authors

- [@reinaldoassis](https://www.github.com/reinaldoassis)

