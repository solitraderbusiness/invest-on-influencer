import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an actual API call
        // const response = await axios.get('/api/v1/analytics/dashboard', {
        //   params: {
        //     time_range: timeRange,
        //     category: categoryFilter !== 'all' ? categoryFilter : undefined,
        //   }
        // });
        // setAnalyticsData(response.data);
        
        // Simulate data for development
        const mockData = {
          growth_trends: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            follower_growth: [2.1, 2.3, 2.8, 3.5, 4.2, 4.8],
            engagement_rates: [4.2, 4.1, 4.3, 4.5, 4.8, 5.1],
            investment_scores: [68, 70, 73, 75, 78, 81],
          },
          category_performance: {
            labels: ['Technology', 'Fitness', 'Travel', 'Food', 'Fashion', 'Entertainment', 'Art'],
            avg_engagement: [4.8, 3.9, 5.2, 4.1, 3.2, 6.8, 7.2],
            avg_growth: [3.2, 2.7, 4.1, 2.9, 1.8, 12.5, 10.2],
            avg_score: [82, 78, 75, 72, 70, 68, 76],
          },
          audience_demographics: {
            age_distribution: [
              { group: '13-17', percentage: 8 },
              { group: '18-24', percentage: 32 },
              { group: '25-34', percentage: 38 },
              { group: '35-44', percentage: 15 },
              { group: '45+', percentage: 7 },
            ],
            gender_distribution: [
              { group: 'Male', percentage: 55 },
              { group: 'Female', percentage: 43 },
              { group: 'Other', percentage: 2 },
            ],
            top_locations: [
              { location: 'United States', percentage: 35 },
              { location: 'United Kingdom', percentage: 12 },
              { location: 'Canada', percentage: 8 },
              { location: 'Germany', percentage: 7 },
              { location: 'Australia', percentage: 6 },
              { location: 'Other', percentage: 32 },
            ],
          },
          investment_opportunities: {
            high_growth: 24,
            undervalued: 18,
            consistent_performers: 42,
            emerging_talents: 36,
          },
          roi_analysis: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            potential_roi: [12, 15, 18, 22],
            market_average: [8, 9, 10, 11],
          },
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, categoryFilter]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="category" className="sr-only">Category</label>
            <select
              id="category"
              name="category"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Fitness">Fitness</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Fashion">Fashion</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Art">Art</option>
            </select>
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`${timeRange === '1m' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleTimeRangeChange('1m')}
            >
              1M
            </button>
            <button
              type="button"
              className={`${timeRange === '3m' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleTimeRangeChange('3m')}
            >
              3M
            </button>
            <button
              type="button"
              className={`${timeRange === '6m' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleTimeRangeChange('6m')}
            >
              6M
            </button>
            <button
              type="button"
              className={`${timeRange === '1y' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'} relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              onClick={() => handleTimeRangeChange('1y')}
            >
              1Y
            </button>
          </div>
        </div>
      </div>

      {analyticsData && (
        <div className="space-y-6">
          {/* Growth Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h2>
            <div className="h-80">
              <Line 
                data={{
                  labels: analyticsData.growth_trends.labels,
                  datasets: [
                    {
                      label: 'Follower Growth (%)',
                      data: analyticsData.growth_trends.follower_growth,
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      yAxisID: 'y',
                    },
                    {
                      label: 'Engagement Rate (%)',
                      data: analyticsData.growth_trends.engagement_rates,
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.5)',
                      yAxisID: 'y',
                    },
                    {
                      label: 'Avg Investment Score',
                      data: analyticsData.growth_trends.investment_scores,
                      borderColor: 'rgb(79, 70, 229)',
                      backgroundColor: 'rgba(79, 70, 229, 0.5)',
                      yAxisID: 'y1',
                    },
                  ],
                }} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  stacked: false,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Percentage (%)',
                      },
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                        drawOnChartArea: false,
                      },
                      title: {
                        display: true,
                        text: 'Score',
                      },
                      min: 0,
                      max: 100,
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }} 
              />
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h2>
            <div className="h-80">
              <Bar 
                data={{
                  labels: analyticsData.category_performance.labels,
                  datasets: [
                    {
                      label: 'Avg Engagement Rate (%)',
                      data: analyticsData.category_performance.avg_engagement,
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    },
                    {
                      label: 'Avg Growth Rate (%)',
                      data: analyticsData.category_performance.avg_growth,
                      backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    },
                    {
                      label: 'Avg Investment Score',
                      data: analyticsData.category_performance.avg_score,
                      backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    },
                  ],
                }} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      grid: {
                        borderDash: [2, 4],
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Audience Demographics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Audience Demographics</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Age Distribution</h3>
                  <div className="h-64">
                    <Doughnut 
                      data={{
                        labels: analyticsData.audience_demographics.age_distribution.map(item => item.group),
                        datasets: [
                          {
                            data: analyticsData.audience_demographics.age_distribution.map(item => item.percentage),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 206, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }} 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Gender Distribution</h3>
                  <div className="h-64">
                    <Pie 
                      data={{
                        labels: analyticsData.audience_demographics.gender_distribution.map(item => item.group),
                        datasets: [
                          {
                            data: analyticsData.audience_demographics.gender_distribution.map(item => item.percentage),
                            backgroundColor: [
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(255, 206, 86, 0.7)',
                            ],
                            borderColor: [
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 99, 132, 1)',
                              'rgba(255, 206, 86, 1)',
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        },
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Opportunities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Investment Opportunities</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">High Growth</p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">{analyticsData.investment_opportunities.high_growth}</p>
                  <p className="mt-1 text-xs text-gray-500">Influencers with exceptional growth rates</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">Undervalued</p>
                  <p className="mt-1 text-3xl font-semibold text-green-600">{analyticsData.investment_opportunities.undervalued}</p>
                  <p className="mt-1 text-xs text-gray-500">High potential with lower follower counts</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">Consistent Performers</p>
                  <p className="mt-1 text-3xl font-semibold text-purple-600">{analyticsData.investment_opportunities.consistent_performers}</p>
                  <p className="mt-1 text-xs text-gray-500">Stable engagement and growth</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">Emerging Talents</p>
                  <p className="mt-1 text-3xl font-semibold text-yellow-600">{analyticsData.investment_opportunities.emerging_talents}</p>
                  <p className="mt-1 text-xs text-gray-500">New creators showing promise</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Potential ROI Analysis</h3>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: analyticsData.roi_analysis.labels,
                      datasets: [
                        {
                          label: 'Potential ROI (%)',
                          data: analyticsData.roi_analysis.potential_roi,
                          borderColor: 'rgb(79, 70, 229)',
                          backgroundColor: 'rgba(79, 70, 229, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                        {
                          label: 'Market Average (%)',
                          data: analyticsData.roi_analysis.market_average,
                          borderColor: 'rgb(156, 163, 175)',
                          backgroundColor: 'rgba(156, 163, 175, 0.1)',
                          borderDash: [5, 5],
                          tension: 0.4,
                          fill: false,
                        },
                      ],
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'ROI (%)',
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h2>
            <div className="h-80">
              <Bar 
                data={{
                  labels: analyticsData.audience_demographics.top_locations.map(item => item.location),
                  datasets: [
                    {
                      label: 'Audience Distribution (%)',
                      data: analyticsData.audience_demographics.top_locations.map(item => item.percentage),
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1,
                    },
                  ],
                }} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Percentage (%)',
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}