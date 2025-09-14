import React, { useState } from 'react';
import { useRules } from '@/hooks/useRules';
import { RuleDetail, fetchRuleById } from '@/api';

const RulesTable: React.FC = () => {
  const {
    rules,
    total,
    loading,
    error,
    filterOptions,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    clearFilters,
  } = useRules();

  const [selectedRule, setSelectedRule] = useState<RuleDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleRuleClick = async (ruleId: string) => {
    setDetailsLoading(true);
    try {
      const details = await fetchRuleById(ruleId);
      setSelectedRule(details);
    } catch (err) {
      console.error('Failed to load rule details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  const handleSortChange = (sortBy: string) => {
    const sortDirection = 
      pagination.sortBy === sortBy && pagination.sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    updatePagination({ sortBy, sortDirection });
  };

  const handleFilterChange = (filterType: keyof typeof filters, values: any) => {
    updateFilters({ [filterType]: values });
  };

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="rules-container">
      {/* Filters Section */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search rules..."
          value={filters.query || ''}
          onChange={(e) => updateFilters({ query: e.target.value })}
        />

        {filterOptions && (
          <>
            <select
              multiple
              value={filters.severities || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('severities', values);
              }}
            >
              {filterOptions.severities.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>

            <select
              multiple
              value={filters.rule_sources || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                handleFilterChange('rule_sources', values);
              }}
            >
              {filterOptions.rule_sources.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>

            <label>
              <input
                type="checkbox"
                checked={filters.has_mitre || false}
                onChange={(e) => updateFilters({ has_mitre: e.target.checked })}
              />
              Has MITRE Mapping
            </label>

            <label>
              <input
                type="checkbox"
                checked={filters.has_cves || false}
                onChange={(e) => updateFilters({ has_cves: e.target.checked })}
              />
              Has CVE References
            </label>
          </>
        )}

        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Results Section */}
      <div className="results-info">
        Showing {rules.length} of {total} rules
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="rules-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange('rule_id')}>
                Rule ID {pagination.sortBy === 'rule_id' && (
                  <span>{pagination.sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('name')}>
                Name {pagination.sortBy === 'name' && (
                  <span>{pagination.sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSortChange('severity')}>
                Severity {pagination.sortBy === 'severity' && (
                  <span>{pagination.sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Source</th>
              <th>MITRE</th>
              <th>CVE</th>
              <th onClick={() => handleSortChange('updated_date')}>
                Updated {pagination.sortBy === 'updated_date' && (
                  <span>{pagination.sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id} onClick={() => handleRuleClick(rule.rule_id)}>
                <td>{rule.rule_id}</td>
                <td>{rule.name}</td>
                <td>
                  <span className={`severity-badge severity-${rule.severity}`}>
                    {rule.severity}
                  </span>
                </td>
                <td>{rule.source.name}</td>
                <td>{rule.extracted_mitre_count}</td>
                <td>{rule.extracted_cve_count}</td>
                <td>{new Date(rule.updated_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Previous
        </button>
        
        <span>
          Page {pagination.page} of {Math.ceil(total / pagination.limit)}
        </span>
        
        <button
          disabled={pagination.page >= Math.ceil(total / pagination.limit)}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Next
        </button>

        <select
          value={pagination.limit}
          onChange={(e) => updatePagination({ limit: Number(e.target.value), page: 1 })}
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Rule Details Modal */}
      {selectedRule && (
        <div className="modal-overlay" onClick={() => setSelectedRule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {detailsLoading ? (
              <div>Loading details...</div>
            ) : (
              <>
                <h2>{selectedRule.name}</h2>
                <p>{selectedRule.description}</p>
                
                <div className="details-grid">
                  <div>
                    <strong>Rule ID:</strong> {selectedRule.rule_id}
                  </div>
                  <div>
                    <strong>Severity:</strong> {selectedRule.severity}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedRule.rule_type}
                  </div>
                  <div>
                    <strong>Source:</strong> {selectedRule.source.name}
                  </div>
                </div>

                {selectedRule.has_deprecated_techniques && (
                  <div className="warning-banner">
                    ⚠️ This rule contains deprecated MITRE techniques
                  </div>
                )}

                <div className="metadata-section">
                  <h3>Metadata</h3>
                  {selectedRule.metadata.siem_platform && (
                    <div>SIEM: {selectedRule.metadata.siem_platform}</div>
                  )}
                  {selectedRule.metadata.aor && (
                    <div>AOR: {selectedRule.metadata.aor}</div>
                  )}
                  {selectedRule.metadata.data_sources && (
                    <div>Data Sources: {selectedRule.metadata.data_sources.join(', ')}</div>
                  )}
                </div>

                <div className="mitre-section">
                  <h3>MITRE Techniques ({selectedRule.mitre_techniques.length})</h3>
                  {selectedRule.mitre_techniques.map(tech => (
                    <div key={tech.technique_id} className="technique-item">
                      <strong>{tech.technique_id}</strong>: {tech.name}
                      {tech.is_deprecated && <span className="deprecated-badge">Deprecated</span>}
                    </div>
                  ))}
                </div>

                <div className="cve-section">
                  <h3>CVE References ({selectedRule.cve_references.length})</h3>
                  {selectedRule.cve_references.map(cve => (
                    <div key={cve.cve_id} className="cve-item">
                      <strong>{cve.cve_id}</strong> - {cve.severity}
                      {cve.cvss_v3_score && <span> (CVSS: {cve.cvss_v3_score})</span>}
                    </div>
                  ))}
                </div>

                <button onClick={() => setSelectedRule(null)}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesTable;