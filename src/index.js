const readline = require("readline");
const colors = require('colors');

class BananaBasic
{
    constructor()
    {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.text = colors.white;
        this.variables = {};
        this.currentVariable = "";
        this.currentLine = "";
        this.code = [];
        this.lines = [];
        this.getLine = true;
    }

    init = () =>
    {
        console.clear();

        console.log("┌──────────────────────────────────────────────────────────────┐");
        console.log("│ BananaBasic                                                  │");
        console.log("│                                                              │");
        console.log("│ A simple, yet powerful Basic Interpreter for the CLI         │");
        console.log("│                                                              │");
        console.log("│ By F. Rick Reich <frickreich@gmail.com>                      │");
        console.log("└──────────────────────────────────────────────────────────────┘");
        console.log();

        this.input();
    }

    input = () =>
    {
        const rl = this.rl;
        
        console.log("  READY.");
        rl.setPrompt('> ');
        rl.prompt();

        rl.on('line', (line) =>
        {
            this.currentLine = line;

            if(line.trim().toUpperCase() === "RUN")
            {
                rl.pause();
            }
            else if(line.trim().toUpperCase() === "END")
            {
                rl.close();
            }
            else if(line.trim().toUpperCase() === "CLS")
            {
                console.clear();
                rl.setPrompt('> ');
                rl.prompt();
            }
            else if(line.trim().toUpperCase() === "LIST")
            {
                this.interpreter();

                this.code.forEach((input, i) =>
                {
                    console.log(`  ${ input.line } ${ input.command }${ input.content ? " " + input.content : ""}`);
                });
                console.log();

                console.log("  READY.");
                
                rl.setPrompt('> ');
                rl.prompt();
            }
            else if(line.trim() === "")
            {
                rl.setPrompt('> ');
                rl.prompt();
            }
            else if(
                line.trim() === "" || 
                line.trim().charAt(0) === "0" ||
                line.trim().charAt(0) === "1" ||
                line.trim().charAt(0) === "2" ||
                line.trim().charAt(0) === "3" ||
                line.trim().charAt(0) === "4" ||
                line.trim().charAt(0) === "5" ||
                line.trim().charAt(0) === "6" ||
                line.trim().charAt(0) === "7" ||
                line.trim().charAt(0) === "8" ||
                line.trim().charAt(0) === "9"
            )
            {
                if(this.getLine)
                {
                    this.lines.push(line);
                
                    rl.setPrompt('> ');
                    rl.prompt();
                }
                else
                {   
                    this.rl.setPrompt('? ');
                    rl.prompt();
                    this.getLine = true;
                }
            }
            else
            {
                this.error();

                rl.setPrompt('> ');
                rl.prompt();
            }
        }).on('pause', () =>
        {
            this.interpreter();
            this.run();
        }).on('resume', () =>
        {
            rl.prompt();
        }).on('close', () =>
        {
            // todo: Make close/end kill the program without repeating the code pattern.
            this.close();
        }).on('SIGINT', function()
        {
            rl.question('\nAre you sure you want to exit? (yes/no) ', function(answer)
            {
                if (answer.match(/^y(es)?$/i))
                {
                    rl.close();
                }
                else
                {
                    rl.setPrompt('> ');
                    rl.prompt();
                }
            });
        });
    }

    interpreter = () =>
    {
        const regExp = /(^\d+)\s(\w+)(?:\s(\S.*))?/;

        this.lines.forEach((line, i) =>
        {
            const command = regExp.exec(line);

            this.buildCode(command);
        });
    }

    run = () =>
    {
        this.code.forEach((input, i) =>
        {
            this.runCode(input);
        })

        
        console.log();
        
        console.log("  READY.");
        this.rl.resume();
    }

    buildCode = (command) =>
    {
        let code = this.code;

        if(code.some(cmd => cmd.line === command[1]))
        {
            code = this.code.filter((cmd, i) => cmd.line !== command[1]);
        }
        
        code.push({ line: command[1], command: command[2].toUpperCase(), content: command[3].toUpperCase() });

        code.sort((a, b) => a.line - b.line);

        this.code = code;
    }

    runCode = (input) =>
    {
        let text = this.text;
        switch(input.command)
        {
            case "PRINT":
                if(input.content.charAt(0) === '"' && input.content.charAt(input.content.length - 1) === '"')
                {
                    console.log(text(`  ${ input.content.substring(1, input.content.length - 1) }`));
                }
                else
                {
                    this.error();
                }
                break;
            case "REM":
                break;
            case "GOTO":
                const codeLine = this.code.find(code => code.line === input.content);

                this.runCode(codeLine);
                break;
            case "CLS": // BROKEN on commands after CLS?!
                console.clear();
                this.rl.setPrompt('> ');
                this.rl.prompt();
                break;
            case "INPUT":
            {
                if(input.content.substring(input.content.length - 1) === "$")
                {
                    this.getLine = false;
                    
                    this.currentVariable = input.content.slice(0, -1);
                    this.variables[this.currentVariable] = this.currentLine;
                    console.log(this.variables);
                }
                else
                {
                    this.error();
                    console.log();
                }
            }
            case "COLOR": // BROKEN?!
                const colorArray = [
                    "black",
                    "blue",
                    "green",
                    "cyan",
                    "red",
                    "magenta",
                    "yellow",
                    "brightWhite",
                    "grey",
                    "brightBlue",
                    "brightGreen",
                    "brightCyan",
                    "brightRed",
                    "brightMagenta",
                    "brightYellow",
                    "white"
                ]

                text = colors[colorArray[input.content]];
            default:
                // this.error();
                break;
        }
    }

    error = (msg = "SYNTAX  ERROR") =>
    {
        console.log("  ?" + msg);
    }

    close = () =>
    {
        console.clear();
        process.exit(0);
    }
}

const banana = new BananaBasic();
banana.init();
