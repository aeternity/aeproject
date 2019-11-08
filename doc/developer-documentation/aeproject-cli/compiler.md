# aeproject compiler

## Start your local compiler

```text
aeproject compiler
```

The **compiler** command will run a compiler locally so all the preprocessor statements get evaluated on you local machine.
The compiler will run by default on `http://localhost:3080`


if you want to stop the compiler you should type
```text
aeproject node --stop
```

If you have running instances of the compiler started from `aeproject` you could check information about the compiler with 

```text
aeproject compiler --info
```