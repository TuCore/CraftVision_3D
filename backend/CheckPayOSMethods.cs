using System;
using System.Reflection;
using System.Linq;
using PayOS;

class Program
{
    static void Main()
    {
        var methods = typeof(PayOSClient).GetMethods();
        foreach (var method in methods)
        {
            Console.WriteLine($"Method: {method.Name}");
            foreach (var p in method.GetParameters())
            {
                Console.WriteLine($"  Param: {p.ParameterType.Name} {p.Name}");
            }
        }
    }
}
