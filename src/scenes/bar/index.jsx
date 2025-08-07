import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar"
import { tokens } from "../../theme";
import { mockBarData as data } from "../../data/mockData";

const BarChart = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode)
  return (
     <ResponsiveBar /* or Bar for fixed dimensions */
        data={data}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: colors.primary[900]
              }
            },
            legend: {
              text: {
                fill: colors.primary[900]
              }
            },
            ticks: {
              line: {
                stroke: colors.primary[900],
                strokeWidth: 1
              },
              text: {
                fill: colors.primary[900],
              }
            }
          },
          legends: {
            text: {
              fill: colors.primary[900],
            }
          }
        }}
        keys={["hot dog", "burger", "fries", "kebab", "sandwich", "donut"]}
        indexBy="country"
        enableLabel={false}
        labelSkipWidth={12}
        labelSkipHeight={12}
        colors={{ scheme: "nivo" }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 120,
                itemsSpacing: 3,
                itemWidth: 100,
                itemHeight: 16
            }
        ]}
        axisBottom={{ legend: 'Mentors', legendOffset: 32 }}
        axisLeft={{ legend: 'Meetings', legendOffset: -40 }}
        margin={{ top: 40, right: 130, bottom: 50, left: 60 }}
    />
  );
};

export default BarChart;
