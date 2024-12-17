"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Container, Typography, MenuItem, Select, Card, CardContent, Grid, Box, Button } from "@mui/material";
import { SelectChangeEvent } from "@mui/material";

// Chart.js 설정
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 타입 정의
type ChartData = {
  labels: string[]; // 시간대
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];  
};

const StationData = () => {
  const [selectedStation, setSelectedStation] = useState("서울역");
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "승차 인원",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: false,
      },
      {
        label: "하차 인원",
        data: [],
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: false,
      },
    ],
  });

  // 데이터 불러오는 함수
  const fetchData = async (station: string) => {
    try {
      // Vercel API 호출
      const res = await fetch(`/api/fetchData`);
      const data = await res.json();

      const rows = data.data.CardSubwayTime.row;
      const filteredRow = rows.find((row: any) => row.STTN === station);

      if (!filteredRow) {
        console.error(`No data found for the station: ${station}`);
        return;
      }

      // 시간대와 승차/하차 데이터 추출
      const times = Array.from({ length: 24 }, (_, i) => `${i}시`);
      const rideData = times.map((_, i) => Number(filteredRow[`HR_${i}_GET_ON_NOPE`]) || 0);
      const getOffData = times.map((_, i) => Number(filteredRow[`HR_${i}_GET_OFF_NOPE`]) || 0);

      // 차트 데이터 업데이트
      setChartData({
        labels: times,
        datasets: [
          { ...chartData.datasets[0], data: rideData },
          { ...chartData.datasets[1], data: getOffData },
        ],
      });
    } catch (error) {
      console.error("Error fetching or processing data:", error);
    }
  };

  // 데이터 처음 로드 및 역 변경 시마다 데이터 새로 불러오기
  useEffect(() => {
    fetchData(selectedStation);
  }, [selectedStation]);

  // 역 선택 변경 처리 함수
  const handleStationChange = (event: SelectChangeEvent) => {
    setSelectedStation(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: "3rem" }}>
      {/* 제목 */}
      <Box sx={{ textAlign: "center", marginBottom: "3rem" }}>
        <Typography variant="h3" color="primary" sx={{ fontWeight: "bold", textShadow: "2px 2px 6px rgba(0, 0, 0, 0.3)" }}>
          {selectedStation} 시간별 승차/하차 인원
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ fontSize: "1.1rem", marginTop: "1rem" }}>
          실시간 승/하차 데이터 기반 차트로, 역의 혼잡도와 교통카드 이용자 수를 파악하기 용이합니다.
        </Typography>
      </Box>

      {/* 역 선택 드롭다운 */}
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ p: 3, boxShadow: 6, borderRadius: 2, backgroundColor: "#f3f3f3" }}>
            <Typography variant="h6" color="primary" sx={{ marginBottom: "1rem", textAlign: "center", fontWeight: "bold" }}>
              역 선택
            </Typography>
            <Select
              value={selectedStation}
              onChange={handleStationChange}
              fullWidth
              variant="outlined"
              color="primary"
              sx={{
                textAlign: "center",
                fontSize: "1.2rem",
                backgroundColor: "#ffffff",
                borderColor: "#1976d2",
                borderRadius: "8px",
                padding: "0.5rem",
              }}
            >
              <MenuItem value="서울역">서울역</MenuItem>
              <MenuItem value="시청">시청</MenuItem>
              <MenuItem value="종각">종각</MenuItem>
              <MenuItem value="종로3가">종로3가</MenuItem>
              <MenuItem value="종로5가">종로5가</MenuItem>
            </Select>
          </Card>
        </Grid>
      </Grid>

      {/* 차트 */}
      <Grid container spacing={5} justifyContent="center" sx={{ marginTop: "3rem" }}>
        <Grid item xs={12} md={10}>
          <Card sx={{ boxShadow: 10, borderRadius: 3, backgroundColor: "#f9f9f9" }}>
            <CardContent>
              <Box sx={{ textAlign: "center", marginBottom: "2rem" }}>
                <Typography variant="h6" color="textPrimary" sx={{ fontWeight: "bold" }}>
                  시간대별 승차/하차 인원
                </Typography>
              </Box>
              <Line data={chartData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 새로고침 버튼 */}
      <Box sx={{ textAlign: "center", marginTop: "3rem" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ padding: "12px 40px", borderRadius: 3, boxShadow: 3 }}
          onClick={() => fetchData(selectedStation)}
        >
          새로고침
        </Button>
      </Box>
    </Container>
  );
};

export default StationData;
