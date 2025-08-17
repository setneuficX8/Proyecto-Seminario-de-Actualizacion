# Proyecto Seminario de actualización 🚀

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

# Un resumen de como empezar un nuevo proyecto

Lo primero es instalar el npm y nodejs en mi caso lo mostrare en como se hace en arch linux 
````bash 
sudo pacman -S npm nodejs 
```` 
una vez instalado se podra crear un nuevo proyecto parv react, nosotros decidimos iniciar el proyecto con **vite** que es una herramienta de compilacion que tiene como objetivo proporcionar una herramientv de desarrollo mas rapida y agil parv proyectos web modernos.
````bash 
npm create vite@latest
```` 
una vez se ejecute este comando se iniciara a descargar algunas dependecias y procedera a preguntarte el nuevo nombre del proyecto, el **framework** en nuestro caso **React** y por ultimo el leguaje de programacion nosotros escogimos **TypeScript** que es basicamente **JavaScript** pero con tipado para poder ver y manejar mejor los errores y con estos ya estaria creado el proyecto.
> **Nota**: cuando estemos dentro de nuestro proyecto debemos ejecutar **npm i** para que nos descargues todas las dependecias. Para correr el proyecto debes de ejecutar **npm run dev**


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
