import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topInfluencers, setTopInfluencers] = useState([]);
  const [trendingInfluencers, setTrendingInfluencers] = useState([]);
  const [growthData, setGrowthData] = useState(null);
  const [stats, setStats] = useState({
    totalInfluencers: 0,
    averageScore: 0,
    potentialOpportunities: 0,
    highGrowthCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be actual API calls
        // For now, we'll simulate the data
        
        // Fetch top influencers
        // const topResponse = await axios.get('/api/v1/analytics/top-influencers?limit=5');
        // setTopInfluencers(topResponse.data);
        
        // Fetch trending influencers
        // const trendingResponse = await axios.get('/api/v1/analytics/trending-influencers?limit=5');
        // setTrendingInfluencers(trendingResponse.data);
        
        // Fetch growth data for chart
        // const growthResponse = await axios.get('/api/v1/analytics/growth-trends');
        // setGrowthData(growthResponse.data);
        
        // Fetch overall stats
        // const statsResponse = await axios.get('/api/v1/analytics/summary-stats');
        // setStats(statsResponse.data);
        
        // Simulate data for development
        setTopInfluencers([
          { id: 1, username: 'tech_influencer', overall_investment_score: 92, follower_count: 1500000, engagement_rate: 4.8, category: 'Technology' },
          { id: 2, username: 'fitness_guru', overall_investment_score: 88, follower_count: 2200000, engagement_rate: 3.9, category: 'Fitness' },
          { id: 3, username: 'travel_explorer', overall_investment_score: 85, follower_count: 980000, engagement_rate: 5.2, category: 'Travel' },
          { id: 4, username: 'food_lover', overall_investment_score: 82, follower_count: 1200000, engagement_rate: 4.1, category: 'Food' },
          { id: 5, username: 'fashion_icon', overall_investment_score: 80, follower_count: 3100000, engagement_rate: 3.2, category: 'Fashion' },
        ]);
        
        setTrendingInfluencers([
          { id: 6, username: 'rising_star', growth_rate: 12.5, follower_count: 350000, engagement_rate: 6.8, category: 'Entertainment' },
          { id: 7, username: 'new_creator', growth_rate: 10.2, follower_count: 180000, engagement_rate: 7.2, category: 'Art' },
          { id: 8, username: 'upcoming_talent', growth_rate: 9.7, follower_count: 420000, engagement_rate: 5.9, category: 'Music' },
          { id: 9, username: 'growing_fast', growth_rate: 8.9, follower_count: 290000, engagement_rate: 6.1, category: 'Gaming' },
          { id: 10, username: 'trending_now', growth_rate: 8.3, follower_count: 520000, engagement_rate: 5.5, category: 'Lifestyle' },
        ]);
        
        setGrowthData({
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Average Follower Growth',
              data: [2.1, 2.3, 2.8, 3.5, 4.2, 4.8],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
              label: 'Average Engagement Rate',
              data: [4.2, 4.1, 4.3, 4.5, 4.8, 5.1],
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
            },
          ],
        });
        
        setStats({
          totalInfluencers: 1248,
          averageScore: 72.5,
          potentialOpportunities: 38,
          highGrowthCount: 86,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Influencers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalInfluencers}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Investment Score</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.averageScore}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Potential Opportunities</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.potentialOpportunities}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">High Growth Influencers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.highGrowthCount}</dd>
          </div>
        </div>
      </div>
      
      {/* Growth Trends Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h2>
        {growthData && (
          <div className="h-80">
            <Line 
              data={growthData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Percentage (%)',
                    },
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
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Influencers */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Influencers by Investment Score</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topInfluencers.map((influencer) => (
                  <tr key={influencer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/influencers/${influencer.id}`} className="text-blue-600 hover:text-blue-900">
                        @{influencer.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{influencer.overall_investment_score}</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${influencer.overall_investment_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat().format(influencer.follower_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {influencer.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/influencers" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all influencers →
            </Link>
          </div>
        </div>
        
        {/* Trending Influencers */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Trending Influencers by Growth Rate</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trendingInfluencers.map((influencer) => (
                  <tr key={influencer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/influencers/${influencer.id}`} className="text-blue-600 hover:text-blue-900">
                        @{influencer.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">{influencer.growth_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {influencer.engagement_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {influencer.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/analytics" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}