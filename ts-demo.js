var message = "Hello";
console.log(message);
//message = true; // Error: Type 'boolean' is not assignable to type 'string'
//Primitive types
var booleanVar = true;
var numberVar = 42;
var symbolVar = Symbol("unique");
var nullVar = null;
var undefinedVar = undefined;
//let bigintVar : bigint = 9007199254741991n;
var anyVar = "Could be anything";
anyVar = anyVar + 100;
var unknownVar = "Unknown type";
//unknownVar = unknownVar + 123;  causes error
// any can be anything, unknown needs typwe assertions
//Array
var score = [100, 98, 95];
//tuples
var student = ["Alice", 20];
//Union type
var id;
id = "Hello";
console.log(id);
id = 1002;
console.log(id);
//id = false; // Error: Type 'boolean' is not assignable to type 'string | number'
//functions
function add(num1, num2) {
    var sum = num1 + num2;
    return "Sum is ".concat(sum);
}
var result = add(10, 20);
console.log(result);
var greet = function (name) {
    if (name === void 0) { name = "Guest"; }
    console.log("Hello, ".concat(name));
};
greet();
//object defination
//1.Object literal
var userDetails = {
    name: "Bob",
    age: 25,
    //desc: "A developer", //optional property
    //isActive: false // Error: Object literal may only specify known properties
};
console.log(userDetails);
var product1 = {
    id: 1,
    name: "Laptop",
    price: 1500, //price: null
};
console.log(product1);
var employee1 = {
    empId: 101,
    empName: "Charlie",
    isPermanent: true,
    product: product1
};
console.log(employee1);
//Generics
function identity(arg) {
    return arg;
}
var output1 = identity("Generic String");
console.log(output1);
var output2 = identity(12345);
console.log(output2);
//Enums //what does enum do?-It allows us to define a set of named constants, making code more readable and maintainable.
var Role;
(function (Role) {
    Role[Role["Admin"] = 0] = "Admin";
    Role[Role["User"] = 1] = "User";
    Role[Role["Guest"] = 2] = "Guest";
})(Role || (Role = {}));
var userRole = Role.Admin;
console.log(userRole); //enum index
console.log(Role[userRole]); //enum value
var role = "Admin";
console.log(role === "admin");
console.log(Role.Admin === userRole);
var update = {
    id: 101
};
console.log(update);
var readOnlyUser = {
    id: 102,
    name: "ReadOnly User",
    role: Role.User
};
//readOnlyUser.id = 103; // Error: Cannot assign to 'id' because it is a read-only property
console.log(readOnlyUser);
//Tasks
//create enum for car types: Sedan, SUV, Truck, Coupe.
//create a type model for Car.
//-name:string, description:string
//create an interface for a car with properties
//make:string, model:CarModel
//year:number or string
//type:CarType
//isElectric:boolean(optional)
//create a array of cars with at least 3 car objects
//filter the cars whose year is greater than 2015 .
var CarType;
(function (CarType) {
    CarType[CarType["Sedan"] = 0] = "Sedan";
    CarType[CarType["SUV"] = 1] = "SUV";
    CarType[CarType["Truck"] = 2] = "Truck";
    CarType[CarType["Coupe"] = 3] = "Coupe";
})(CarType || (CarType = {}));
var cars = [
    {
        make: "Toyota",
        model: { name: "Camry", description: "A comfortable midsize sedan" },
        year: 2018,
        type: CarType.Sedan,
        isElectric: false
    },
    {
        make: "Tesla",
        model: { name: "Model X", description: "A high-performance electric SUV" },
        year: 2020,
        type: CarType.SUV,
        isElectric: true
    },
    {
        make: "Ford",
        model: { name: "F-150", description: "A popular full-size truck" },
        year: 2014,
        type: CarType.Truck
    }
];
var filteredCars = cars.filter(function (car) {
    return typeof car.year === 'number' && car.year > 2015;
});
console.log(filteredCars);
