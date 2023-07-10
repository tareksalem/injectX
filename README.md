<div align="center">
	<h1>InjectX</h1>
	<h4 align="center">
        A dependency injection library for functional programming in typescript and javascript
	</h4>
</div>

<p align="center">
	<a href="#-installation-and-documentation">Installation</a> ❘
	<a href="#-features">Features</a> ❘
	<a href="#-usage">Usage</a> |
    <a href="/examples">Examples</a>
</p>

## 🚀&nbsp; Installation and Documentation

```bash
npm install injectX
```

### Support

This package can be used either in frontend or backend with the same installation and the same examples described bellow


## 🥙 &nbsp; Features

- it's designed to do dependency injection for your functions using higher order functions
- simple configuration and better code organization
- built in dependency injection container
- leverage inversion of control princple usage
- can be used either on frontend or backend
- can be used either in js code or typescript

## 📄&nbsp; Usage

### The Concept

This library is based on four main components:
- A dependency that needs to be used in other code parts, it's called (dependency)
- A consumer that consumes that injected dependency
- A dependency injection container that holds all dependencies
- A dependencies resolver, its a function that resolve the needed dependencies at runtime

The injection of the dependencies is run at runtime, so don't worry about the order of dependencies injection

### Create a Dependency

The dependency could be anything, it could be an object, array, variable, function, class or any value you want

I will declare a function as a dependency

```typescript
const getUserName = () => {
    return "john-smith"
}
```

It's a normal function, no magic here
How can I use this function as a dependency?

you need at first bind it to the container, so you can access it from other code parts

```typescript
GetContainer("default").Bind(getUsername)
```

`GetContainer` is a function exposed from InjectX, it's responsible for binding this dependency to the container, so you can access it from somewhere else. This `GetContainer` takes one param, which is the container name

#### What is the container name?

As we discussed eariler, the container is a key component in injectX, it holds a reference to all the dependencies, and because your application might scale and has multiple modules, you can define multiple containers for each module, to keep each module has it's isolated dependencis

For example supposing you have the following module:

- OrdersModule
- UsersModule
- CatalogModule

Each module of these should have its own dependencies and you should avoid mixing dependencies between different modules, and to achieve that, you can define a different container for each module

The default container name for injectX is `default` so you can call `GetContainer` without passing the container name, and it will be resolved automatically to the default container

```typescript
GetContainer().Bind(getUsername)
```

To Bind a dependency to the container you have to call `Bind` function which takes the following arguments

|argument name|type|required|description|
|-|-|-|-|
|dependency|any|true|this is the dependency you want to bind to the container, it could be any thing(number, string, object, array, function, class, map, symbol)|
|options|object|false|some options you can define for the injected dependency|
|options.name|string|false|you can define this to customize the name of the injected dependency, for example you can bind a number and make it's name as `myValue` so you can access it from anywhere using that defined name|

### Create a Dependency Consumer

InjectX uses a friendly way for defining functions, which are higher order functions

Any dependency you want to declare you can define it as a higher order function, the first params of the dependency are the dependencies you want to inject in, and the second parameter is the actual params you are expecting to be sent to your function

for example suppose we have a repository function like this:

```typescript
const getUserRepository = (username: string) => {
    return db.users.find(user => user.username === username)
}
```

You need to provide `db` to be able to use this function, in normal cases you will import the db into the global scope as the following:

```typescript
import db from './db';

const getUserRepository = (username: string) => {
    return db.users.find(user => user.username === username)
}
```
but this violates the inversion of control principle, so to use the dependency injection, you want to inject db object somehow into `getUserRepository`
You can use higher order function to do that, so your code will be changed to this

```typescript
export const GetUserRepository = ({ db }: { db: DB }) => (username: string) => {
    return db.users.find(user => user.username === username)
}
```

In this updated example, we are defining a higher order function, the first function takes the dependencies you want to inject, and it returns another function that holds the actual implementation

### How to use the higher order function?

Without InjectX you can still use higher order function pattern to do dependency injection, but you will need when you call this function to pass to it the needed dependencies, which makes it complex

With injectX there is a function called `InjectIn` it resolves the needed dependencies that this higher order function needs and returns a new resolved function contains the actual implementation

this function takes the following arguments:

|argument name|type|required|description|
|-|-|-|-|
|the higher order function|higher order function|true|this is the higher order function|
|options|object|false|some options you can define to resolve the higher order function|
|options.containers|string[]|false|in case you want to resolve multiple dependencies from multiple containers, then you can use this option|
|options.resolveType|enum: `lazy|eager`|false|how do you want to resolve the dependencies, eager means the dependencies will be resolved once you call `InjectIn` function, however lazy will be done while running the app|
|callbackName|string|false|in case you want to change the signature name of the returned function|

Example:

```typescript
    export const getUserReposistory = InjectIn(GetUserRepository)
```
the returned const `getUserRepository` is basically a normal function (it's the same function that you defined) but after resolving the dependencies, then u can use this function to be injected in another consumers or call it directly

Calling the resolved function
```typescript
console.log(getUserRepository("username"))
```

### Resolve multiple dependencies from multiple containers

Sometimes you would have multiple containers and you want to inject dependencies from these containers in a function, to do that you can use `options.containers`

**Example:**

Suppose you have two containers:
- orders
- default

and you want to inject dependencies from each container, you can do as the following:

```typescript
export const getUserReposistory = InjectIn(GetUserRepository, { containers: ['default', 'orders'] })
```

in this way it will inject the needed dependencies from both containers, but you also need to change the higher order function a little bit

```typescript
export const GetUserRepository = ({ default: { db }, orders: { orderService } }: { default: { db: DB }, orders: { orderService: any } }) => (username: string) => {
    const user = db.users.find(user => user.username === username)
    const orders = orderService.getAllOrdersByUserId(user.id)
    return { orders, user }
}
```

In the above example instead of accepting one object in the higher order function, we accept two objects for the two containers, one for default container and the another for orders
