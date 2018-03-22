using System;
using System.Collections.Generic;
using System.IO;

namespace CsvFiles
{
    class Record 
    {
        public long Unix { get; set; }
        public double Value { get; set; }
    }

    /**
      This C# program generates CSV records in a time,value format
     */
    class CsvTimeSeriesGenerator
    {
        
        private static void GenerateRecords(int numberOfRecords, string outputFileName) 
        {
            var list = new List<Record>();
            var random = new Random(DateTime.Now.Millisecond);
            var referenceValue = random.NextDouble();
            var startOfUnixEpoch = new DateTime(1970, 1, 1);
            var dateTime = DateTime.Now;
            for (int i=0; i < numberOfRecords; i++) 
            {
                var randomValue = referenceValue + (0.5 - random.NextDouble())/10.0;
                list.Add(new Record() 
                {
                    Unix = Convert.ToInt64((dateTime.AddSeconds(i*30) - startOfUnixEpoch).TotalMilliseconds),
                    Value = randomValue
                });
                referenceValue = randomValue;
            }
            using (StreamWriter outputFile = new StreamWriter(string.Format(@"{0}.csv", outputFileName))) 
            {
                outputFile.WriteLine("unix,value");
                foreach (Record element in list)
                    outputFile.WriteLine(string.Format("{0},{1}", element.Unix, element.Value));
            }
        }

        static void Main(string[] args)
        {
            GenerateRecords(50000, "50k");
            Console.WriteLine("Completed");
        }
    }
}
