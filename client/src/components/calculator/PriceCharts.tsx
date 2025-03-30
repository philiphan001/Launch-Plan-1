import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface PriceData {
  stickerPrice: number;
  averagePrice: number | null;
  myPrice: number;
  tuition: number;
  roomAndBoard: number;
  fees: number;
  books: number;
}

interface PriceChartsProps {
  priceData: PriceData;
  collegeName: string;
}

const PriceCharts = ({ priceData, collegeName }: PriceChartsProps) => {
  // Prepare data for the first chart - price comparison
  const priceComparisonData = [
    {
      name: 'Sticker Price',
      value: priceData.stickerPrice,
      fill: '#8884d8'
    },
    {
      name: 'Average Price',
      value: priceData.averagePrice || 0,
      fill: '#82ca9d'
    },
    {
      name: 'My Price',
      value: priceData.myPrice,
      fill: '#ffc658'
    }
  ];

  // Prepare data for the second chart - cost breakdown
  const costBreakdownData = [
    {
      name: 'Tuition',
      value: priceData.tuition,
      fill: '#8884d8'
    },
    {
      name: 'Room & Board',
      value: priceData.roomAndBoard,
      fill: '#82ca9d'
    },
    {
      name: 'Fees',
      value: priceData.fees,
      fill: '#ffc658'
    },
    {
      name: 'Books & Supplies',
      value: priceData.books,
      fill: '#ff8042'
    }
  ];

  // Format dollar amounts for tooltips
  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium text-lg mb-4">Price Comparison for {collegeName}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priceComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="value" name="Cost" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This chart compares the published price (sticker price), the average price students pay, and your
            estimated price based on your financial information.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium text-lg mb-4">Cost Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costBreakdownData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="value" name="Cost" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This chart breaks down the components that make up the total cost of attendance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceCharts;