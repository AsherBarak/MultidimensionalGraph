import {A} from "./a";

	class Main {
		Run() {
			alert("hi");
			var a=new A();
			a.Hi();
		}
	}

alert("entering");
var main = new Main()
main.Run();
