// Types
export type PropertyKey = string | symbol;
export type MetadataStore = Map<string, Map<string, any>>;
type Target = object & { constructor?: Callback; __metadataStore?: MetadataStore };

/**
 * @param {*} target
 * @param {PropertyKey} propertyKey
 * @returns {string}
 */
const getKeyId = (target: any, propertyKey?: PropertyKey): string => {
	return propertyKey === undefined ? tostring(target) : `${tostring(target)}.${tostring(propertyKey)}`;
};

/**
 * Gets all the keys in the map as an Array.
 *
 * @param {ReadonlyMap<K, V>} map - The map to get the keys from
 * @returns {Array<K>}
 */
const getMapKeys = <K extends defined, V>(map: ReadonlyMap<K, V>): Array<K> => {
	const result = new Array<K>(map.size());

	map.forEach((_, key) => {
		result.push(key);
	});

	return result;
};

/**
 * Represents a Reflector class that provides
 * reflection capabiltiies.
 *
 * @class Reflector
 * @classdesc The Reflector class allows introspetion and dynamic manipulation of objects and classes.
 */
export default class Reflector {
	/**
	 * Defines metadata for the specified class with the given key and value.
	 *
	 * @static
	 * @param {string} metadataKey - The key identifying the metadata.
	 * @param {*} metadataValue - The value of the metadata to set.
	 * @returns {void}
	 *
	 * @example
	 * // Define metadata for a class method
	 * class MyClass {
	 * 	(at)Reflector.defineMetadata('description', 'This is a method')
	 * 	myMethod() { ... }
	 * }
	 */
	static defineMetadata(metadataKey: string, metadataValue: any): (...args: unknown[]) => void;
	/**
	 * Defines metadata for the specified object or class with the given key, value, and property key.
	 *
	 * @static
	 * @param {*} target - The object or class to define metadata for.
	 * @param {string} metadataKey - The key identifying the metadata.
	 * @param {*} metadataValue - The value of the metadata to set.
	 * @param {PropertyKey?} propertyKey - The key identifying the property to associate the metadata with.
	 * @returns {void}
	 *
	 * @example
	 * // Define metadata for an object property
	 * const myObject = {}
	 *
	 * Reflector.defineMetadata(myObject, "description", "This is a property", "myProperty")
	 */
	static defineMetadata(target: any, metadataKey: string, metadataValue: any, propertyKey?: PropertyKey): void;
	static defineMetadata(
		targetOrMetadataKey: string | any,
		metadataKeyOrValue: string | any,
		metadataValue?: any,
		propertyKey?: PropertyKey,
	): any {
		// Decide which way to define metadata based on overloads.
		if (
			(metadataValue as unknown) === undefined &&
			propertyKey === undefined &&
			typeIs(targetOrMetadataKey, "string")
		) {
			// It's declared the declarative way
			const metadataKey = targetOrMetadataKey as string;
			const metadataValue = metadataKeyOrValue as any;

			// Create a @decorator
			return function (target: any, propertyKey: PropertyKey, _descriptor: TypedPropertyDescriptor<any>) {
				const metadataStore = Reflector.createOrGetMetadataStore(target);
				const keyId = getKeyId(target, propertyKey); // Get the metadata key id.
				const hasMetadata = Reflector.hasMetadata(target, metadataKey, propertyKey); // Check if store has metadata

				if (!hasMetadata) metadataStore.set(keyId, new Map<string, any>());

				metadataStore.get(keyId)!.set(metadataKey, metadataValue);
			};
		}

		// Declared in the imperative ways
		const target = targetOrMetadataKey as any;
		const metadataKey = metadataKeyOrValue as string;

		const metadataStore = Reflector.createOrGetMetadataStore(target);
		const keyId = getKeyId(target, propertyKey); // Get the key id
		const hasMetadata = Reflector.hasMetadata(target, metadataKey, propertyKey); // Check if store has metadata

		if (!hasMetadata) metadataStore.set(keyId, new Map<string, any>());

		metadataStore.get(keyId)!.set(metadataKey, metadataValue);
	}

	/**
	 * Retrieves an array of keys for the metadata associated with the specific object or class.
	 *
	 * @static
	 * @param {*} target - The object or class to define metadata for.
	 * @param {PropertyKey?} propertyKey - The key identifying the property to associate the metadata with.
	 * @returns {Array<PropertyKey>|undefined}
	 *
	 * @example
	 * // Define metadata for class property
	 * class MyClass { }
	 *
	 * Reflector.defineMetadata(MyClass, "version", "1.0");
	 * Reflector.defineMetadata(MyClass, "author", "John Doe");
	 *
	 * const metadataKeys = Reflector.getMetadataKeys(MyClass);
	 * // ^ metadataKeys: ['version', 'author']
	 *
	 * // Retrieve metadata keys for an object
	 * const myObject = {}
	 *
	 * Reflector.defineMetadata(myObject, "description", "This is an object");
	 * Reflector.defineMetadata(myObject, "createdBy", "Jane Smith");
	 *
	 * const metadataKeys = Reflector.getMetadataKeys(myObject);
	 * // ^ metadataKeys: ['description', 'createdBy']
	 */
	static getMetadataKeys(target: any, propertyKey?: PropertyKey) {
		const metadataStore = Reflector.getMetadataStore(target);

		if (metadataStore === undefined) return undefined;

		const keyId = getKeyId(target, propertyKey); // Get the Key id
		const metadata = metadataStore.get(keyId);

		if (!metadata) return undefined;

		return getMapKeys(metadata);
	}

	/**
	 * Checks if the specified object or class has metadata associated with the given key.
	 *
	 * @static
	 * @param {*} target - The object or class to define metadata for.
	 * @param {string} metadataKey - The key identifying the metadata.
	 * @param {PropertyKey?} propertyKey - The key identifying the property to associate the metadata with.
	 * @returns {boolean} True if metadata exists for the key, false otherwise.
	 *
	 * @example
	 * // Check if a class has specific metadata
	 * class MyClass {}
	 *
	 * Reflector.defineMetadata(MyClass, 'version', '1.0');
	 *
	 * const hasVersionMetadata = Reflector.hasMetadata(MyClass, 'version');
	 * ^ // hasVersionMetadata: true
	 *
	 * const hasAuthorMetadata = Reflector.hasMetadata(MyClass, 'author');
	 * // hasAuthorMetadata: false
	 *
	 * // Check if an object has specific metadata
	 * const myObject = {};
	 *
	 * Reflector.defineMetadata(myObject, 'description', 'This is an object');
	 *
	 * const hasDescriptionMetadata = Reflector.hasMetadata(myObject, 'description');
	 * // hasDescriptionMetadata: true
	 *
	 * const hasCreatedByMetadata = Reflector.hasMetadata(myObject, 'createdBy');
	 * // hasCreatedByMetadata: false
	 */
	static hasMetadata(target: any, metadataKey: string, propertyKey?: PropertyKey) {
		const metadataStore = Reflector.getMetadataStore(target);
		if (metadataStore === undefined) return false;

		const keyId = getKeyId(target, propertyKey);

		if (!metadataStore.has(keyId)) return false;
		if (metadataStore.get(keyId)!.get(metadataKey) === undefined) return false;

		return true;
	}

	/**
	 * Retrieves the metadata value associated with the given key on the specified object or class.
	 *
	 * @static
	 * @param {*} target - The object or class to retrieve metadata from.
	 * @param {string} metadataKey - The key identifying the metadata.
	 * @param {PropertyKey} propertyKey - The key identifying the property to associate the metadata with.
	 * @returns {*} The value of the metadata associated with the key, or undefined if not found.
	 */
	static getMetadata<T>(target: any, metadataKey: string, propertyKey?: PropertyKey): T | undefined {
		const metadataStore = Reflector.getMetadataStore(target);
		if (metadataStore === undefined) return undefined;

		const keyId = getKeyId(target, propertyKey);

		if (metadataStore.has(keyId)) return metadataStore.get(keyId)!.get(metadataKey);

		return undefined;
	}

	/**
	 * @internal
	 * @private
	 * @static
	 * @param {Target} target
	 * @returns {*}  {(MetadataStore | undefined)}
	 */
	private static getMetadataStore(target: Target): MetadataStore | undefined {
		if (target === undefined) return undefined;
		if (target && target["__metadataStore"] === undefined) return undefined;

		return (target as any).__metadataStore as MetadataStore;
	}

	/**
	 * @internal
	 * @private
	 * @static
	 * @param {Target} target
	 * @returns {*}  {MetadataStore}
	 */
	private static createOrGetMetadataStore(target: Target): MetadataStore {
		if (target && target["__metadataStore"] === undefined) {
			target.__metadataStore = new Map<string, Map<string, any>>();
		}

		return (target as any).__metadataStore;
	}
}
