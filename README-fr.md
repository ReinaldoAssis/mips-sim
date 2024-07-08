![Chakra](https://img.shields.io/badge/chakra-%234ED1C5.svg?style=for-the-badge&logo=chakraui&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)

**Choisissez votre langue**


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

Un simulateur basé sur l'architecture MIPS 32 conçu pour aider les étudiants à apprendre et à explorer les bases du langage d'assemblage et des schémas de circuits.

## Fonctionnalités

- Éditeur de code intégré
- Exécution et débogage pas à pas
- Sortie E/S (écran et clavier) [EN COURS]
- Sortie terminal
- Visualisation des schémas [EN COURS]

## Documentation

Une documentation est encore à faire, pour le moment, je recommande de consulter les instructions d'utilisation et de lire la page de l'ensemble d'instructions.

## Utilisation/Exemples

Voici le code par défaut lorsque vous ouvrez l'éditeur pour la première fois, il calcule le nième nombre de la séquence de Fibonacci. Vous pouvez soit appuyer sur le bouton vert pour assembler et exécuter, soit parcourir chaque instruction à l'aide du bouton jaune. Le résultat s'affiche dans le terminal.

```assembly
addi $t0, $zero, 0 #f1
addi $t1, $zero, 1 #f2
addi $a0, $zero, 15 #n
addi $a0, $a0, -1

fibonacci:
    addi $a0, $a0, -1
    add $t2, $t0, $t1 #somme
    add $t0, $zero, $t1 #f1 = f2
    add $t1, $zero, $t2 #f2 = somme
    beq $a0, $zero, main
    bne $a0, $zero, fibonacci

main:
    addi $v0, $t1, 0
    call 1



## Screenshots

Éditeur et terminal

![Editor and terminal](https://i.ibb.co/3RHngxw/image.png)

Instruction Set

![Instruction Set](https://i.ibb.co/PYVB0np/image.png)

## Auteurs

- [@reinaldoassis](https://www.github.com/reinaldoassis)

