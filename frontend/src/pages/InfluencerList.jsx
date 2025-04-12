import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export default function InfluencerList() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('overall_investment_score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minFollowers: '',
    maxFollowers: '',
    minScore: '',
    maxScore: '',
  });

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an actual API call with filters
        // const response = await axios.get('/api/v1/influencers', {
        //   params: {
        //     sort_by: sortField,
        //     sort_order: sortDirection,
        //     search: searchTerm,
        //     category: filters.category,
        //     min_followers: filters.minFollowers || undefined,
        //     max_followers: filters.maxFollowers || undefined,
        //     min_score: filters.minScore || undefined,
        //     max_score: filters.maxScore || undefined,
        //   }
        // });
        // setInfluencers(response.data);
        
        // Simulate data for development
        const mockInfluencers = [
          { id: 1, username: 'tech_influencer', full_name: 'Tech Expert', overall_investment_score: 92, follower_count: 1500000, engagement_rate: 4.8, category: 'Technology', growth_rate: 3.2 },
          { id: 2, username: 'fitness_guru', full_name: 'Fitness Coach', overall_investment_score: 88, follower_count: 2200000, engagement_rate: 3.9, category: 'Fitness', growth_rate: 2.7 },
          { id: 3, username: 'travel_explorer', full_name: 'Travel Blogger', overall_investment_score: 85, follower_count: 980000, engagement_rate: 5.2, category: 'Travel', growth_rate: 4.1 },
          { id: 4, username: 'food_lover', full_name: 'Food Critic', overall_investment_score: 82, follower_count: 1200000, engagement_rate: 4.1, category: 'Food', growth_rate: 2.9 },
          { id: 5, username: 'fashion_icon', full_name: 'Fashion Designer', overall_investment_score: 80, follower_count: 3100000, engagement_rate: 3.2, category: 'Fashion', growth_rate: 1.8 },
          { id: 6, username: 'rising_star', full_name: 'Entertainment Star', overall_investment_score: 78, follower_count: 350000, engagement_rate: 6.8, category: 'Entertainment', growth_rate: 12.5 },
          { id: 7, username: 'new_creator', full_name: 'Digital Artist', overall_investment_score: 76, follower_count: 180000, engagement_rate: 7.2, category: 'Art', growth_rate: 10.2 },
          { id: 8, username: 'upcoming_talent', full_name: 'Music Producer', overall_investment_score: 75, follower_count: 420000, engagement_rate: 5.9, category: 'Music', growth_rate: 9.7 },
          { id: 9, username: 'growing_fast', full_name: 'Gaming Streamer', overall_investment_score: 74, follower_count: 290000, engagement_rate: 6.1, category: 'Gaming', growth_rate: 8.9 },
          { id: 10, username: 'trending_now', full_name: 'Lifestyle Blogger', overall_investment_score: 72, follower_count: 520000, engagement_rate: 5.5, category: 'Lifestyle', growth_rate: 8.3 },
          { id: 11, username: 'beauty_expert', full_name: 'Makeup Artist', overall_investment_score: 70, follower_count: 890000, engagement_rate: 4.7, category: 'Beauty', growth_rate: 3.5 },
          { id: 12, username: 'health_coach', full_name: 'Wellness Coach', overall_investment_score: 68, follower_count: 670000, engagement_rate: 4.9, category: 'Health', growth_rate: 4.2 },
        ];
        
        // Apply search filter
        let filteredInfluencers = mockInfluencers;
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.username.toLowerCase().includes(search) || 
            inf.full_name.toLowerCase().includes(search) ||
            inf.category.toLowerCase().includes(search)
          );
        }
        
        // Apply category filter
        if (filters.category) {
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.category === filters.category
          );
        }
        
        // Apply follower count filters
        if (filters.minFollowers) {
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.follower_count >= parseInt(filters.minFollowers)
          );
        }
        if (filters.maxFollowers) {
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.follower_count <= parseInt(filters.maxFollowers)
          );
        }
        
        // Apply score filters
        if (filters.minScore) {
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.overall_investment_score >= parseInt(filters.minScore)
          );
        }
        if (filters.maxScore) {
          filteredInfluencers = filteredInfluencers.filter(inf => 
            inf.overall_investment_score <= parseInt(filters.maxScore)
          );
        }
        
        // Apply sorting
        filteredInfluencers.sort((a, b) => {
          if (sortDirection === 'asc') {
            return a[sortField] - b[sortField];
          } else {
            return b[sortField] - a[sortField];
          }
        });
        
        setInfluencers(filteredInfluencers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching influencers:', err);
        setError('Failed to load influencers. Please try again later.');
        setLoading(false);
      }
    };

    fetchInfluencers();
  }, [searchTerm, sortField, sortDirection, filters]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minFollowers: '',
      maxFollowers: '',
      minScore: '',
      maxScore: '',
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const categories = [
    'Technology', 'Fitness', 'Travel', 'Food', 'Fashion', 
    'Entertainment', 'Art', 'Music', 'Gaming', 'Lifestyle',
    'Beauty', 'Health'
  ];

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
        <h1 className="text-2xl font-semibold text-gray-900">Influencers</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search influencers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="minFollowers" className="block text-sm font-medium text-gray-700">Min Followers</label>
              <input
                type="number"
                name="minFollowers"
                id="minFollowers"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={filters.minFollowers}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="maxFollowers" className="block text-sm font-medium text-gray-700">Max Followers</label>
              <input
                type="number"
                name="maxFollowers"
                id="maxFollowers"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={filters.maxFollowers}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="minScore" className="block text-sm font-medium text-gray-700">Min Score</label>
              <input
                type="number"
                name="minScore"
                id="minScore"
                min="0"
                max="100"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={filters.minScore}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">Max Score</label>
              <input
                type="number"
                name="maxScore"
                id="maxScore"
                min="0"
                max="100"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={filters.maxScore}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Influencers Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Influencer
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('overall_investment_score')}
                >
                  <div className="flex items-center">
                    Investment Score
                    {sortField === 'overall_investment_score' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('follower_count')}
                >
                  <div className="flex items-center">
                    Followers
                    {sortField === 'follower_count' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('engagement_rate')}
                >
                  <div className="flex items-center">
                    Engagement
                    {sortField === 'engagement_rate' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('growth_rate')}
                >
                  <div className="flex items-center">
                    Growth Rate
                    {sortField === 'growth_rate' && (
                      sortDirection === 'asc' ? 
                        <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {influencers.length > 0 ? (
                influencers.map((influencer) => (
                  <tr key={influencer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">{influencer.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <Link to={`/influencers/${influencer.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900">
                            @{influencer.username}
                          </Link>
                          <div className="text-sm text-gray-500">{influencer.full_name}</div>
                        </div>
                      </div>
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
                      {formatNumber(influencer.follower_count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {influencer.engagement_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {influencer.growth_rate > 5 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            +{influencer.growth_rate}%
                          </span>
                        ) : influencer.growth_rate > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            +{influencer.growth_rate}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {influencer.growth_rate}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {influencer.category}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No influencers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}