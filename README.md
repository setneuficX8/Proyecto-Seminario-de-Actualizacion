# Semana 2

## Proyecto Seminario de actualización 🚀

### Integrantes del proyecto 

- Keyla Dayana Arboleda Mina 

- Carlos Andres Cifuentes Montaño

- Darío Restrepo Landázuri

- Jose Fernando Sinisterra Ibargüen 

# Pros y contra de react

### Pros:

- Aprender React es más sencillo si ya se tiene experiencia con HTML y JavaScript, porque su sintaxis con JSX se parece mucho a lo que ya se conoce.
- La idea de construir la interfaz mediante componentes, hace que el código sea más organizado y fácil de escalar.
- En caso de tener dificultades o dudas, está disponible la documentación y también la comunidad; como por ejemplo en redes sociales como Stack Overflow, Reddit y discord.

### Contras:

- Al principio puede ser un poco abrumador, porque se deben tener presentes conceptos como los estados, las props y los hooks, y acostumbrarte a mezclar HTML y JavaScript en un mismo archivo, lo cual se siente raro al inicio.
- Otro detalle es que React solo se encarga de la parte visual, la interfaz de usuario. Entonces, si quiere crear una aplicación más completa será necesario añadir más recursos como por ejemplo **React Router** o en su defecto utilizar su framework, **Next.js**.

# Semana 3

## Un resumen de como empezar un nuevo proyecto
Para instalar Node.js en Windows, primero debes descargar el instalador desde el sitio oficial de Node.js. Luego, ejecuta el archivo MSI y sigue los pasos del asistente de instalación, aceptando los términos y seleccionando la ubicación deseada. Finalmente, verifica la instalación abriendo la CMD y ejecutando node -v npm -v . Si todo salió bien, deberías ver la versión de Node.js y npm.


Lo primero es instalar el npm y nodejs en este caso se mostrara en como se hace en arch linux 
````bash 
sudo pacman -S npm nodejs 
```` 
![Proceso](/src/Img/250817_00h53m56s_screenshot.png)

una vez instalado se podra crear un nuevo proyecto parv react, nosotros decidimos iniciar el proyecto con **vite** que es una herramienta de compilacion que tiene como objetivo proporcionar una herramientv de desarrollo mas rapida y agil parv proyectos web modernos.
> **Nota** El proceso de creación del proyecto es igual tanto para linux como para Windows. 
````bash 
npm create vite@latest
```` 
![Creacion_proyecto](/src/Img/vite.png)

una vez se ejecute este comando se iniciara a descargar algunas dependecias y procedera a preguntarte el nuevo nombre del proyecto, el **framework** en nuestro caso **React** y por ultimo el leguaje de programacion nosotros escogimos **TypeScript** que es basicamente **JavaScript** pero con tipado para poder ver y manejar mejor los errores y con estos ya estaria creado el proyecto.
> **Nota**: cuando estemos dentro de nuestro proyecto debemos ejecutar **npm i** para que nos descargues todas las dependecias. Para correr el proyecto debes de ejecutar **npm run dev**


![Proceso](/src/Img/img1.png)

![Proceso](/src/Img/img2.png)

![Proceso](/src/Img/web.png)
> **Nota** Muesta del proceso descrito.

# Semana 4 
