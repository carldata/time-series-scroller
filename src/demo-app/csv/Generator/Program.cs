using System;
using System.Collections.Generic;
using System.IO;

namespace CsvFiles
{
    class Record 
    {
        public DateTime TimeStamp { get; set; }
        public double Value { get; set; }
    }

    /**
      This C# program generates CSV records in a time,value format
     */
    class Program
    {
        
        private static void GenerateRecords(int numberOfRecords, string outputFileName) 
        {
            var list = new List<Record>();
            var random = new Random(DateTime.Now.Millisecond);
            var referenceValue = random.NextDouble();
            var dateTime = DateTime.Now;
            for (int i=0; i < numberOfRecords; i++) 
            {
                var randomValue = referenceValue + (0.5 - random.NextDouble())/10.0;
                list.Add(new Record() 
                {
                    TimeStamp = dateTime.AddSeconds(i*30),
                    Value = randomValue
                });
                referenceValue = randomValue;
            }
            using (StreamWriter outputFile = new StreamWriter(string.Format(@"{0}.csv", outputFileName))) 
            {
                outputFile.WriteLine("time,value");
                foreach (Record element in list)
                    outputFile.WriteLine(string.Format("{0:yyyy-MM-dd HH:mm:ss},{1}", element.TimeStamp, element.Value));
            }
        }

        static void Main(string[] args)
        {
            GenerateRecords(2000000, "2M");
            Console.WriteLine("Completed");
        }
    }
}
