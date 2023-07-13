# @rbxts/reflector

### Metadata Reflection API for Roblox-TS

The Reflector Class provides reflection capabilities, allowing you to
introspect and<br/> dynamically manipulate objects and classes. It offers
methods to inspect and interact witha<br/>properties, methods, and metadata of objects.

## Installation

```console
foo@bar:~$ pnpm add @rbxts/reflector
foo@bar:~$ npm install @rbxts/reflector
foo@bar:~$ yarn add @rbxts/reflector
```

## Usage

```typescript
import Reflector from "@rbxts/reflector"

// Define metadata for a class method declaratively.
class MyClass {
	@Reflector.defineMetadata(MyClass, "version", "1.0")
	myMethod() {...}

	anotherMethod() {...}
}

// Define metadata for a class method imperatively
Reflector.defineMetadata(MyClass, "description", "This is a method.", "anotherMethod");

// Retrieve metadata from a class.
const versionMetadata = Reflector.getMetadata(MyClass, "version");
// ^ versionMetadata: '1.0'

// Check if a class has specific metadata.
const hasVersionMetadata = Reflector.hasMetadata(MyClass, "version");
// ^ hasVersionMetadata: true

// Retrieve metadata keys for a class
const metadataKeys = Reflector.getMetadataKeys(MyClass);
// ^ metadataKeys: ['version']

// Using a decorator to add metadata to a class method.
function MyDecorator(value: string) {
	return function(target: any, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<any>) {
		Reflector.defineMetadata(target, "something", value, propertyKey);
	}
}

class AnotherClass {
	@MyDecorator("Woah this is a method.")
	myMethod() {...}
}

const somethingMetadata = Reflector.getMetadata(AnotherClass, "something", "myMethod")
// ^ somethingMetadata: "Woah this is a method."
```

## API

### `Reflector.defineMetadata(target, key, value, propertyKey?) (Overload 1)`

### `Reflector.defineMetadata(key, value) (Overload 2)`

Defines metadata for the specified object or class with the given key, value, and propertykey, or just the key and value if used in the declarative way.

-   `target` (any) The object or class to define metadata for.<br/>
-   `key` (string|symbol) The key identifying the metadata.<br/>
-   `value` (any) The value of the metadata to set.<br/>
-   `propertyKey` (string?)

### `Reflector.getMetadataKeys(target, propertyKey?)`

Retrieves an array of keys for the metadata associated with the specific object or class.

-   `target` (any) The object or class to define metadata for.<br/>
-   `propertyKey` (string?)

### `Reflector.hasMetadata(target, propertyKey?)`

Checks if the specified object or class has metadata associated with the given key.

-   `target` (any) The object or class to define metadata for.<br/>
-   `key` (string|symbol) The key identifying the metadata.<br/>
-   `propertyKey` (string?)

### `Reflector.hasMetadata(target, propertyKey?)`

Retrieves the metadata value associated with the given key on the specified object or class.

-   `target` (any) The object or class to define metadata for.<br/>
-   `key` (string|symbol) The key identifying the metadata.<br/>
-   `propertyKey` (string?)

## License

This project is licensed under the MIT License. See the LICENSE file for details.
