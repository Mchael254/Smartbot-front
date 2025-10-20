import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Upload as UploadIcon, FileText, Brain, Server, Database, Zap, HelpCircle, Link, Trash2 } from 'lucide-react';
import PdfUploadComponent from './pdfUpload';
import PdfListComponent from './pdfList';
import Modal from './modal';
import ResponseComponent from './response';
import { useSnackbar } from '../hooks/snackBar';
import type { PdfFileWithSelection } from '../types/pdf';
import { urlsService, type WebUrl, type InsertWebUrlRequest } from '../services/knowledgeBase/urlsService';
import knowledgeBaseService from '../services/knowledgeBase/knowledgeBaseService';
import type { KnowledgeBaseReloadResponse, KnowledgeBaseStats } from '../types/knowledgeBase';
import pdfService from '../services/knowledgeBase/pdfService';

const PdfManagement: React.FC = () => {
  const { open, message, severity, showSnackbar, handleClose } = useSnackbar();
  
  const [files, setFiles] = useState<PdfFileWithSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'urls' | 'knowledge'>('list');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Knowledge base state
  const [kbStats, setKbStats] = useState<KnowledgeBaseStats | null>(null);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbReloading, setKbReloading] = useState(false);
  const [kbError, setKbError] = useState<string | null>(null);
  const [lastReloadResult, setLastReloadResult] = useState<KnowledgeBaseReloadResponse | null>(null);
  const [llmServiceHealth, setLlmServiceHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // URLs state
  const [urls, setUrls] = useState<WebUrl[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsError, setUrlsError] = useState<string | null>(null);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [showDeleteUrlModal, setShowDeleteUrlModal] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<WebUrl | null>(null);
  const [urlFormData, setUrlFormData] = useState({ title: '', url: '', description: '' });
  const [deletingUrls, setDeletingUrls] = useState<Set<string>>(new Set());
  
  // Timeout references for auto-hiding messages
  const reloadResultTimeoutRef = useRef<number | null>(null);
  const kbErrorTimeoutRef = useRef<number | null>(null);

  // Cleanup function for timeouts
  const clearMessageTimeouts = () => {
    if (reloadResultTimeoutRef.current) {
      clearTimeout(reloadResultTimeoutRef.current);
      reloadResultTimeoutRef.current = null;
    }
    if (kbErrorTimeoutRef.current) {
      clearTimeout(kbErrorTimeoutRef.current);
      kbErrorTimeoutRef.current = null;
    }
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      clearMessageTimeouts();
    };
  }, []);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
    loadKnowledgeBaseStats();
    checkLlmServiceHealth();
  }, []);

  // Load URLs when URLs tab becomes active
  useEffect(() => {
    if (activeTab === 'urls') {
      loadUrls();
    }
  }, [activeTab]);



  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pdfService.getAllPdfs();
      // console.log('PDF All Response:', response); 
      setFiles(response.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load files';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeBaseStats = async () => {
    try {
      setKbLoading(true);
      setKbError(null);
      const stats = await knowledgeBaseService.getStats();
      setKbStats(stats);
    } catch (error) {
      console.error('Failed to load knowledge base stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load knowledge base stats';
      setKbError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setKbLoading(false);
    }
  };

  const checkLlmServiceHealth = async () => {
    try {
      setLlmServiceHealth('checking');
      await knowledgeBaseService.checkHealth();
      setLlmServiceHealth('healthy');
      showSnackbar('LLM service is online and ready', 'success');
    } catch (error) {
      console.error('LLM service health check failed:', error);
      setLlmServiceHealth('unhealthy');
      showSnackbar('LLM service is offline. Please check the connection.', 'error');
    }
  };

  const handleKnowledgeBaseReload = async () => {
    try {
      setKbReloading(true);
      setKbError(null);
      setLastReloadResult(null);
      clearMessageTimeouts(); // Clear any existing timeouts
      
      console.log('Starting knowledge base reload...');
      showSnackbar('Starting knowledge base reload...', 'warning');
      
      const result = await knowledgeBaseService.reloadKnowledgeBase(true);
      
      console.log('Knowledge base reload result:', result);
      setLastReloadResult(result);
      
      // Set timeout to auto-hide success message after 30 seconds
      reloadResultTimeoutRef.current = setTimeout(() => {
        setLastReloadResult(null);
      }, 6000);
      
      // Show success message
      if (result.status === 'success') {
        showSnackbar(`Knowledge base reloaded successfully! ${result.documents_count || 0} documents loaded.`, 'success');
      } else {
        showSnackbar(`Knowledge base reload completed with warnings: ${result.message}`, 'warning');
      }
      
      // Refresh stats after reload
      await loadKnowledgeBaseStats();
      
    } catch (error) {
      console.error('Failed to reload knowledge base:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reload knowledge base';
      setKbError(errorMessage);
      showSnackbar(errorMessage, 'error');
      
      // Set timeout to auto-hide error message after 30 seconds
      kbErrorTimeoutRef.current = setTimeout(() => {
        setKbError(null);
      }, 6000);
    } finally {
      setKbReloading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    if (activeTab === 'knowledge') {
      await loadKnowledgeBaseStats();
      await checkLlmServiceHealth();
    } else if (activeTab === 'urls') {
      await loadUrls();
    }
    setRefreshing(false);
  };

  // URLs management functions
  const loadUrls = async () => {
    try {
      setUrlsLoading(true);
      setUrlsError(null);
      
      const response = await urlsService.getAllUrls();
      setUrls(response.urls);
      
    } catch (error) {
      console.error('Failed to load URLs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load URLs';
      setUrlsError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setUrlsLoading(false);
    }
  };

  const handleAddUrl = async (urlData: InsertWebUrlRequest) => {
    try {
      const response = await urlsService.insertUrl(urlData);
      if (response.success) {
        await loadUrls(); // Refresh the list
        showSnackbar(response.message || 'URL added successfully!', 'success');
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to add URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add URL';
      showSnackbar(errorMessage, 'error');
      return { success: false, message: errorMessage };
    }
  };

  const handleToggleUrlActive = async (urlId: string) => {
    try {
      const response = await urlsService.toggleUrlActive(urlId);
      if (response.success) {
        await loadUrls(); // Refresh the list
        showSnackbar(response.message || 'URL status updated successfully!', 'success');
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to toggle URL active status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle URL status';
      showSnackbar(errorMessage, 'error');
      return { success: false, message: errorMessage };
    }
  };

  const handleDeleteUrl = async (url: WebUrl) => {
    setUrlToDelete(url);
    setShowDeleteUrlModal(true);
  };

  const confirmDeleteUrl = async (): Promise<{ success: boolean; message: string }> => {
    if (!urlToDelete || deletingUrls.has(urlToDelete.id)) {
      return { success: false, message: 'Delete operation already in progress' };
    }

    setDeletingUrls(prev => new Set(prev).add(urlToDelete.id));
    
    try {
      const response = await urlsService.deleteUrl(urlToDelete.id);
      if (response.success) {
        await loadUrls(); // Refresh the list
        setShowDeleteUrlModal(false);
        setUrlToDelete(null);
        showSnackbar(response.message || 'URL deleted successfully!', 'success');
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to delete URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete URL';
      showSnackbar(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setDeletingUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(urlToDelete.id);
        return newSet;
      });
    }
  };

  const handleUploadSuccess = useCallback(() => {
    // Refresh file list after successful upload
    loadFiles();
    // Close the upload modal
    setShowUploadModal(false);
    showSnackbar('PDF uploaded successfully!', 'success');
  }, [showSnackbar]);

  const handleUploadError = useCallback((error: string) => {
    setError(error);
    showSnackbar(error, 'error');
  }, [showSnackbar]);

  const handleDelete = useCallback((filename: string) => {
    // Remove file from local state after successful deletion
    setFiles(prev => prev.filter(file => file.filename !== filename));
    showSnackbar('PDF deleted successfully!', 'success');
  }, [showSnackbar]);

  const handleView = useCallback((url: string) => {
    // This is handled in the PdfListComponent
    console.log('Viewing PDF:', url);
  }, []);

  const handleToggleSelection = useCallback(async (pdfId: string) => {
    try {
      setError(null);
      const response = await pdfService.togglePdfSelection(pdfId);
      
      if (response.success) {
        // Update the local state with the new selection status
        setFiles(prev => prev.map(file => 
          file.id === pdfId 
            ? { ...file, is_selected: response.data.is_selected }
            : file
        ));
        
        const statusText = response.data.is_selected ? 'selected' : 'unselected';
        showSnackbar(`PDF ${statusText} successfully!`, 'success');
        console.log('PDF selection toggled successfully:', response.data);
      } else {
        throw new Error(response.message || 'Failed to toggle PDF selection');
      }
    } catch (error) {
      console.error('Failed to toggle PDF selection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle PDF selection';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  }, [showSnackbar]);

  return (
    <div className="w-[78vw] min-h-[85vh] bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Knowledge Base Management</h2>
            <p className="text-gray-600 mt-1">Manage PDFs and control the AI knowledge base</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* LLM Service Status */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium">
              <div className={`w-2 h-2 rounded-full ${
                llmServiceHealth === 'healthy' ? 'bg-green-500' : 
                llmServiceHealth === 'unhealthy' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={
                llmServiceHealth === 'healthy' ? 'text-green-700' : 
                llmServiceHealth === 'unhealthy' ? 'text-red-700' : 'text-yellow-700'
              }>
                LLM {llmServiceHealth === 'checking' ? 'Checking...' : llmServiceHealth === 'healthy' ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer
                ${refreshing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
                }
              `}
              style={{ backgroundColor: refreshing ? undefined : '#00963f' }}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || kbError) && (
        <div className="mb-6 space-y-2">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-600 text-sm">
                  <strong>PDF Error:</strong> {error}
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {kbError && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-orange-600 text-sm flex-1">
                  <strong>Knowledge Base Error:</strong> {kbError}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs text-orange-600">Auto-hides in 30s</span>
                  <button
                    onClick={() => {
                      setKbError(null);
                      if (kbErrorTimeoutRef.current) {
                        clearTimeout(kbErrorTimeoutRef.current);
                        kbErrorTimeoutRef.current = null;
                      }
                    }}
                    className="text-orange-400 hover:text-orange-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm cursor-pointer
                ${activeTab === 'list'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              style={{ 
                borderBottomColor: activeTab === 'list' ? '#00963f' : undefined,
                color: activeTab === 'list' ? '#00963f' : undefined
              }}
            >
              <FileText size={16} />
              <span>Manage Files ({files.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('urls')}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm cursor-pointer
                ${activeTab === 'urls'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              style={{ 
                borderBottomColor: activeTab === 'urls' ? '#00963f' : undefined,
                color: activeTab === 'urls' ? '#00963f' : undefined
              }}
            >
              <Link size={16} />
              <span>Manage URLs ({urls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm cursor-pointer
                ${activeTab === 'knowledge'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              style={{ 
                borderBottomColor: activeTab === 'knowledge' ? '#00963f' : undefined,
                color: activeTab === 'knowledge' ? '#00963f' : undefined
              }}
            >
              <Brain size={16} />
              <span>Knowledge Base</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Manage PDF Files</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <UploadIcon size={16} />
                <span>Upload PDF</span>
              </button>
            </div>
            <PdfListComponent
              files={files}
              onDelete={handleDelete}
              onView={handleView}
              onToggleSelection={handleToggleSelection}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'urls' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Manage Web URLs</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddUrlModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                >
                  <Link size={16} />
                  <span>Add URL</span>
                </button>
                <button
                  onClick={loadUrls}
                  disabled={urlsLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
                >
                  <RefreshCw size={16} className={urlsLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* URLs Error Display */}
            {urlsError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <div className="text-red-600 text-sm flex-1">
                    <strong>Error:</strong> {urlsError}
                  </div>
                  <button
                    onClick={() => setUrlsError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* URLs List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="text-md font-medium text-gray-900">
                  Web URLs ({urls.length})
                </h4>
              </div>
              
              {urlsLoading ? (
                <div className="p-4 text-center">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading URLs...</p>
                </div>
              ) : urls.length === 0 ? (
                <div className="p-4 text-center">
                  <Link size={20} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No URLs found</p>
                  <p className="text-xs text-gray-400">Add your first web URL using the button above</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {urls.map((url) => (
                      <div key={url.id} className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h5 className="text-sm font-medium text-gray-900 truncate">
                                    {url.title}
                                  </h5>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    url.is_active 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {url.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <a
                                  href={url.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline block truncate mt-0.5"
                                  title={url.url}
                                >
                                  {urlsService.formatUrl(url.url, 60)}
                                </a>
                                {url.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {url.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-3 flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleUrlActive(url.id)}
                              className={`px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                                url.is_active
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {url.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteUrl(url)}
                              disabled={deletingUrls.has(url.id)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                deletingUrls.has(url.id)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title="Delete URL"
                            >
                              {deletingUrls.has(url.id) ? (
                                <div className="animate-spin h-3.5 w-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">AI Knowledge Base Control</h3>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      title="How it works"
                    >
                      <HelpCircle size={18} className="text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">Manage and reload the AI model's knowledge base</p>
                </div>
              </div>
              
              <button
                onClick={handleKnowledgeBaseReload}
                disabled={kbReloading || llmServiceHealth !== 'healthy'}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer
                  ${kbReloading || llmServiceHealth !== 'healthy'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }
                `}
              >
                <Database size={20} className={kbReloading ? 'animate-spin' : ''} />
                <span>{kbReloading ? 'Reloading Knowledge Base...' : 'Reload Knowledge Base'}</span>
              </button>
            </div>

            {/* Knowledge Base Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Service Status */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    llmServiceHealth === 'healthy' ? 'bg-green-100' : 
                    llmServiceHealth === 'unhealthy' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    <Server size={20} className={
                      llmServiceHealth === 'healthy' ? 'text-green-600' : 
                      llmServiceHealth === 'unhealthy' ? 'text-red-600' : 'text-yellow-600'
                    } />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">LLM Service</p>
                    <p className={`text-lg font-semibold ${
                      llmServiceHealth === 'healthy' ? 'text-green-700' : 
                      llmServiceHealth === 'unhealthy' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {llmServiceHealth === 'checking' ? 'Checking...' : 
                       llmServiceHealth === 'healthy' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Files Count */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText size={20} className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">PDF Files</p>
                    <p className="text-lg font-semibold text-green-700">
                      {kbLoading ? '...' : kbStats?.files_count || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Embeddings Count */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain size={20} className="text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Embeddings</p>
                    <p className="text-lg font-semibold text-purple-700">
                      {kbLoading ? '...' : kbStats?.embeddings_count || '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Update */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <RefreshCw size={20} className="text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm font-semibold text-orange-700">
                      {kbLoading ? '...' : 
                       kbStats?.last_load_stats?.last_load_time ? 
                       new Date(kbStats.last_load_stats.last_load_time).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Files and URLs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Active PDF Files */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FileText size={18} className="text-green-600 mr-2" />
                  Active PDF Files ({kbStats?.files_count || 0})
                </h4>
                {kbLoading ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : kbStats?.files && kbStats.files.length > 0 ? (
                  <div className="space-y-2">
                    {kbStats.files.map((file: string, index: number) => (
                      <div key={index} className="flex items-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200">
                        <FileText size={14} className="text-green-600 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No PDF files loaded</div>
                )}
              </div>

              {/* Active URLs */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Zap size={18} className="text-blue-600 mr-2" />
                  Web Sources ({kbStats?.urls_count || 0})
                </h4>
                {kbLoading ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : kbStats?.urls && kbStats.urls.length > 0 ? (
                  <div className="space-y-2">
                    {kbStats.urls.map((url: string, index: number) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 rounded border border-blue-200">
                        <Zap size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                          title={url}
                        >
                          {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No web sources configured</div>
                )}
              </div>
            </div>

            {/* Last Reload Result */}
            {lastReloadResult && (
              <div className={`rounded-lg p-4 mb-6 border ${
                lastReloadResult.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    lastReloadResult.status === 'success' ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Last Reload Result
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${
                      lastReloadResult.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      Auto-hides in 6s
                    </span>
                    <button
                      onClick={() => {
                        setLastReloadResult(null);
                        if (reloadResultTimeoutRef.current) {
                          clearTimeout(reloadResultTimeoutRef.current);
                          reloadResultTimeoutRef.current = null;
                        }
                      }}
                      className={`${
                        lastReloadResult.status === 'success' 
                          ? 'text-green-400 hover:text-green-600' 
                          : 'text-yellow-400 hover:text-yellow-600'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Status:</strong> {lastReloadResult.status}</p>
                  <p><strong>Message:</strong> {lastReloadResult.message}</p>
                  {lastReloadResult.load_duration && (
                    <p><strong>Duration:</strong> {knowledgeBaseService.formatDuration(lastReloadResult.load_duration)}</p>
                  )}
                  {lastReloadResult.documents_count && (
                    <p><strong>Documents Loaded:</strong> {lastReloadResult.documents_count}</p>
                  )}
                  {lastReloadResult.synced_count && (
                    <p><strong>PDFs Synced:</strong> {lastReloadResult.synced_count}</p>
                  )}
                  {lastReloadResult.removed_count && lastReloadResult.removed_count > 0 && (
                    <p><strong>Old PDFs Removed:</strong> {lastReloadResult.removed_count}</p>
                  )}
                </div>
              </div>
            )}


          </div>
        )}
      </div>

      {/* Statistics */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-lg font-semibold text-gray-900">{files.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <UploadIcon size={20} className="text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-lg font-semibold text-gray-900">
                  {pdfService.formatFileSize(
                    files.reduce((total, file) => total + file.size, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <RefreshCw size={20} className="text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">
                  {files.length > 0 
                    ? new Date(Math.max(...files.map(f => new Date(f.created_at).getTime()))).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete URL Confirmation Modal */}
      <Modal 
        open={showDeleteUrlModal} 
        setOpen={(open: boolean) => {
          setShowDeleteUrlModal(open);
          if (!open) {
            setUrlToDelete(null);
          }
        }}
        title="Confirm URL Deletion"
        description="This action cannot be undone. The URL will be permanently removed from your knowledge base."
      >
        {urlToDelete && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    You are about to delete:
                  </h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <p><strong>Title:</strong> {urlToDelete.title}</p>
                    <p><strong>URL:</strong> <span className="break-all">{urlToDelete.url}</span></p>
                    {urlToDelete.description && (
                      <p><strong>Description:</strong> {urlToDelete.description}</p>
                    )}
                    <p><strong>Status:</strong> {urlToDelete.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                <strong>Warning:</strong> If this URL is currently part of your knowledge base, 
                you may need to reload the knowledge base to reflect this change.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteUrlModal(false);
                  setUrlToDelete(null);
                }}
                disabled={deletingUrls.has(urlToDelete.id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteUrl()}
                disabled={deletingUrls.has(urlToDelete.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors ${
                  deletingUrls.has(urlToDelete.id)
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {deletingUrls.has(urlToDelete.id) ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add URL Modal */}
      <Modal 
        open={showAddUrlModal} 
        setOpen={(open: boolean) => {
          setShowAddUrlModal(open);
          if (!open) {
            setUrlsError(null);
            setUrlFormData({ title: '', url: '', description: '' });
          }
        }}
        title="Add New Web URL"
        description="Add a web URL to your knowledge base for AI to process"
      >
        <form 
          id="addUrlForm"
          onSubmit={async (e) => {
            e.preventDefault();
            
            const urlData: InsertWebUrlRequest = {
              title: urlFormData.title.trim(),
              url: urlFormData.url.trim(),
              description: urlFormData.description.trim() || undefined,
              is_active: true
            };

            if (!urlsService.isValidUrl(urlData.url)) {
              setUrlsError('Please enter a valid URL');
              return;
            }

            const result = await handleAddUrl(urlData);
            if (result.success) {
              setShowAddUrlModal(false);
              setUrlsError(null);
              setUrlFormData({ title: '', url: '', description: '' });
            } else {
              setUrlsError(result.message);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              id="modal-title"
              required
              value={urlFormData.title}
              onChange={(e) => setUrlFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter URL title"
            />
          </div>
          
          <div>
            <label htmlFor="modal-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL *
            </label>
            <input
              type="url"
              name="url"
              id="modal-url"
              required
              value={urlFormData.url}
              onChange={(e) => setUrlFormData(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              id="modal-description"
              rows={2}
              value={urlFormData.description}
              onChange={(e) => setUrlFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Optional description"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="modal-is_active"
              defaultChecked={true}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="modal-is_active" className="ml-2 block text-sm text-gray-900">
              Active (available for AI knowledge base)
            </label>
          </div>
          
          {urlsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{urlsError}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddUrlModal(false);
                setUrlsError(null);
                setUrlFormData({ title: '', url: '', description: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={urlsLoading || !urlFormData.title.trim() || !urlFormData.url.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center space-x-2 transition-colors ${
                urlsLoading || !urlFormData.title.trim() || !urlFormData.url.trim()
                  ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Link size={16} />
              <span>Add URL</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Help Modal */}
      <Modal 
        open={showHelpModal} 
        setOpen={setShowHelpModal}
        title="How AI Knowledge Base Control Works"
        description="Learn how to manage your AI knowledge base effectively"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">Knowledge Base Management Process:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li><strong>Reload Knowledge Base:</strong> Click the "Reload Knowledge Base" button to update the AI model with the latest selected PDFs from your Supabase storage</li>
              <li><strong>Automatic Sync:</strong> The system automatically downloads selected PDFs from Supabase storage to the local knowledge base</li>
              <li><strong>Cleanup Process:</strong> Old unselected PDFs are automatically removed to keep the knowledge base current and relevant</li>
              <li><strong>Embedding Generation:</strong> The AI model rebuilds its knowledge embeddings with the new content for optimal search and retrieval</li>
              <li><strong>Status Monitoring:</strong> Monitor the entire process through the real-time status indicators and statistics displayed above</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">Status Indicators:</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li><strong>LLM Service:</strong> Shows if the AI service is online and ready</li>
              <li><strong>PDF Files:</strong> Number of PDF documents currently loaded in the knowledge base</li>
              <li><strong>Embeddings:</strong> Total number of text chunks processed and available for search</li>
              <li><strong>Last Updated:</strong> Timestamp of the most recent knowledge base refresh</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-3">Important Notes:</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>The reload process may take several minutes depending on the number and size of PDFs</li>
              <li>Only PDFs marked as "selected" in the PDF List tab will be included in the knowledge base</li>
              <li>Web sources (URLs) are also supported and will be displayed in the Web Sources section</li>
              <li>The AI service must be online (green status) before attempting a reload</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal 
        open={showUploadModal} 
        setOpen={setShowUploadModal}
        title="Upload PDF Files"
        description="Select PDF files to upload to your knowledge base"
      >
        <PdfUploadComponent
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          className="w-full"
        />
      </Modal>

      {/* Response Component for Snackbar notifications */}
      <ResponseComponent
        open={open}
        handleClose={handleClose}
        message={message}
        type={
          severity === "success" || severity === "error" || severity === "warning"
            ? severity
            : severity === "info" 
              ? "warning" 
              : "error"
        }
        autoHideDuration={4000}
      />
    </div>
  );
};

export default PdfManagement;