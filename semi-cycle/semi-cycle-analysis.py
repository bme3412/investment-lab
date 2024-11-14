"""
Enhanced Semiconductor Cycle Analysis Tool
Tracks and visualizes semiconductor industry cycles using financial metrics
Includes historical cycle analysis, expanded company coverage, and detailed annotations
"""

import pandas as pd
import numpy as np
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from scipy.signal import savgol_filter, find_peaks
from sklearn.preprocessing import StandardScaler

class SemiCycleAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the analyzer with API key and configuration"""
        self.api_key = api_key
        self.base_url = "https://financialmodelingprep.com/api/v3"
        
        # Historical cycles reference
        self.historical_cycles = {
            '1990s': {
                'boom': ('1993-01-01', '1995-12-31'),
                'bust': ('1996-01-01', '1998-12-31'),
                'notes': 'PC-driven cycle',
                'drivers': {
                    'boom': [
                        'Mass PC adoption',
                        'Windows 95 launch',
                        'Corporate PC refresh'
                    ],
                    'bust': [
                        'Manufacturing overcapacity',
                        'Asian financial crisis',
                        'Inventory correction'
                    ]
                }
            },
            'dotcom': {
                'boom': ('1999-01-01', '2000-12-31'),
                'bust': ('2001-01-01', '2002-12-31'),
                'notes': 'Internet bubble',
                'drivers': {
                    'boom': [
                        'Internet infrastructure buildout',
                        'Y2K spending surge',
                        'Telecom expansion'
                    ],
                    'bust': [
                        'Dot-com bubble burst',
                        'Telecom crash',
                        'Enterprise spending freeze'
                    ]
                }
            },
            '2006-2009': {
                'boom': ('2006-01-01', '2007-12-31'),
                'bust': ('2008-01-01', '2009-12-31'),
                'notes': 'Financial crisis',
                'drivers': {
                    'boom': [
                        'Mobile phone growth',
                        'Early smartphone era',
                        'Gaming console cycle'
                    ],
                    'bust': [
                        'Global financial crisis',
                        'Consumer spending drop',
                        'Credit market freeze'
                    ]
                }
            },
            '2016-2019': {
                'boom': ('2016-01-01', '2018-12-31'),
                'bust': ('2019-01-01', '2019-12-31'),
                'notes': 'Memory-led cycle',
                'drivers': {
                    'boom': [
                        'Data center expansion',
                        'Memory price increases',
                        'Crypto mining demand'
                    ],
                    'bust': [
                        'Memory oversupply',
                        'Trade tensions',
                        'Inventory correction'
                    ]
                }
            },
            '2020-2023': {
                'boom': ('2020-03-01', '2022-09-30'),
                'bust': ('2022-10-01', '2023-12-31'),
                'notes': 'Post-COVID super cycle',
                'drivers': {
                    'boom': [
                        'Work-from-home demand',
                        'Supply chain shortages',
                        'Cloud/AI expansion'
                    ],
                    'bust': [
                        'PC/smartphone slowdown',
                        'Inventory digestion',
                        'Consumer weakness'
                    ]
                }
            }
        }
        
        # Enhanced company categories with expanded coverage
        self.companies = {
            'equipment': {
                'tickers': [
                    'ASML',     # Lithography leader
                    'AMAT',     # Broad equipment portfolio
                    'LRCX',     # Etch leader
                    'KLAC',     # Inspection/metrology
                    'TER',      # Test equipment
                    'TOELY',    # Tokyo Electron
                    'ACLS',     # Axcelis Technologies
                    'CCMP',     # CMC Materials
                    'UCTT',     # Ultra Clean Holdings
                    'MKSI'      # MKS Instruments
                ],
                'weight': 0.3,
                'color': '#1f77b4',
                'cycle_sensitivity': 'very high',
                'notes': 'First to show cycle turns, high operating leverage'
            },
            'foundry': {
                'tickers': [
                    'TSM',      # TSMC
                    'UMC',      # United Microelectronics
                    'GWGRF',    # GlobalWafers
                    'SUMCF',    # Sumco Corp
                    'SIMO',     # Silicon Motion
                    'SILC',     # Silicon Labs
                    'VSH',      # Vishay
                    'OIIM'      # O2Micro International
                ],
                'weight': 0.25,
                'color': '#ff7f0e',
                'cycle_sensitivity': 'high',
                'notes': 'Capex driven, capacity indicates cycle'
            },
            'memory': {
                'tickers': [
                    'MU',       # Micron
                    'WDC',      # Western Digital
                    'STX',      # Seagate
                    'SSNLF',    # Samsung Electronics
                    'KIOXF',    # Kioxia
                    'NTDOF'     # Nanya Technology
                ],
                'weight': 0.25,
                'color': '#2ca02c',
                'cycle_sensitivity': 'very high',
                'notes': 'Most volatile, pricing sensitivity'
            },
            'logic': {
                'tickers': [
                    'NVDA',     # NVIDIA
                    'AMD',      # Advanced Micro Devices
                    'INTC',     # Intel
                    'QCOM',     # Qualcomm
                    'AVGO',     # Broadcom
                    'MRVL',     # Marvell
                    'ADI',      # Analog Devices
                    'TXN',      # Texas Instruments
                    'NXPI',     # NXP Semiconductors
                    'ON'        # ON Semiconductor
                ],
                'weight': 0.2,
                'color': '#d62728',
                'cycle_sensitivity': 'medium',
                'notes': 'More stable margins, end-market diversity'
            },
            'specialized': {
                'tickers': [
                    'SWKS',     # Skyworks
                    'QRVO',     # Qorvo
                    'MPWR',     # Monolithic Power
                    'WOLF',     # Wolfspeed
                    'DIOD',     # Diodes Inc
                    'POWI',     # Power Integrations
                    'SITM',     # SiTime
                    'AMBA'      # Ambarella
                ],
                'weight': 0.1,
                'color': '#9467bd',
                'cycle_sensitivity': 'medium-high',
                'notes': 'Niche markets, specialized applications'
            }
        }
        
        # Enhanced metrics with cycle relevance
        self.metrics = {
            'quarterly_revenue_growth': {
                'weight': 0.25,
                'description': 'QoQ revenue growth',
                'higher_is_better': True,
                'cycle_timing': 'leading',
                'typical_range': (-15, 25)
            },
            'gross_margin': {
                'weight': 0.25,
                'description': 'Gross profit margin',
                'higher_is_better': True,
                'cycle_timing': 'coincident',
                'typical_range': (30, 65)
            },
            'inventory_turnover': {
                'weight': 0.25,
                'description': 'Revenue/Inventory (annualized)',
                'higher_is_better': True,
                'cycle_timing': 'leading',
                'typical_range': (3, 8)
            },
            'operating_margin': {
                'weight': 0.25,
                'description': 'Operating profit margin',
                'higher_is_better': True,
                'cycle_timing': 'coincident',
                'typical_range': (15, 45)
            }
        }

    def _fetch_data(self, endpoint: str) -> List[Dict]:
        """Helper method to fetch data from Financial Modeling Prep API"""
        try:
            url = f"{self.base_url}{endpoint}&apikey={self.api_key}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    return data
                else:
                    print(f"Unexpected response format from API: {data}")
                    return []
            else:
                print(f"API call failed with status code: {response.status_code}")
                if response.status_code == 429:
                    print("Rate limit exceeded. Please wait before making more requests.")
                elif response.status_code == 403:
                    print("API key invalid or expired.")
                print(f"Error response: {response.text}")
                return []
                
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    def fetch_financial_data(self, ticker: str) -> pd.DataFrame:
        """Fetch and process financial statements for a company"""
        print(f"\nFetching data for {ticker}...")
        try:
            # Fetch quarterly statements
            income_stmt = self._fetch_data(f'/income-statement/{ticker}?period=quarter&limit=60')
            balance_sheet = self._fetch_data(f'/balance-sheet-statement/{ticker}?period=quarter&limit=60')
            
            if not income_stmt or not balance_sheet:
                print(f"No data available for {ticker}")
                return pd.DataFrame()

            # Process income statement
            df_income = pd.DataFrame(income_stmt)
            df_balance = pd.DataFrame(balance_sheet)
            
            # Convert dates and sort
            for df in [df_income, df_balance]:
                df['date'] = pd.to_datetime(df['date'])
                df.sort_values('date', inplace=True)
            
            # Merge statements
            df = pd.merge_asof(
                df_income[['date', 'revenue', 'grossProfit', 'operatingIncome']],
                df_balance[['date', 'inventory']],
                on='date',
                direction='backward'
            )
            
            # Calculate metrics
            df['quarterly_revenue_growth'] = df['revenue'].pct_change() * 100
            df['gross_margin'] = (df['grossProfit'] / df['revenue']) * 100
            df['operating_margin'] = (df['operatingIncome'] / df['revenue']) * 100
            df['inventory_turnover'] = np.where(
                df['inventory'] > 0,
                (df['revenue'] * 4) / df['inventory'],  # Annualized
                np.nan
            )
            
            # Add TTM metrics
            df['ttm_revenue'] = df['revenue'].rolling(4).sum()
            df['ttm_revenue_growth'] = df['ttm_revenue'].pct_change(4) * 100
            
            return df
            
        except Exception as e:
            print(f"Error processing {ticker}: {e}")
            return pd.DataFrame()

    def _process_company_data(self, data: pd.DataFrame, ticker: str) -> Tuple[pd.Series, Dict]:
        """Process company metrics into composite score"""
        if data.empty:
            return pd.Series(dtype=float), {}

        metric_scores = pd.DataFrame(index=data['date'])
        metric_stats = {}
        
        for metric, info in self.metrics.items():
            if metric not in data.columns:
                continue
            
            raw_data = data.set_index('date')[metric].copy()
            
            # Remove outliers
            low, high = info['typical_range']
            raw_data_clipped = raw_data.clip(low, high)
            
            # Standardize scores
            scaler = StandardScaler()
            score = pd.Series(
                scaler.fit_transform(raw_data_clipped.values.reshape(-1, 1)).flatten(),
                index=raw_data_clipped.index
            )
            
            # Adjust direction and weight
            if not info['higher_is_better']:
                score = -score
            weighted_score = score * info['weight']
            metric_scores[metric] = weighted_score
            
            # Store statistics
            metric_stats[metric] = {
                'current': raw_data.iloc[-1],
                'mean': raw_data.mean(),
                'std': raw_data.std(),
                'min': raw_data.min(),
                'max': raw_data.max()
            }

        # Combine scores
        combined_score = metric_scores.sum(axis=1)
        
        # Smooth the score
        try:
            window = min(5, len(combined_score)-2)
            smoothed_score = pd.Series(
                savgol_filter(combined_score, window, 3),
                index=combined_score.index
            )
        except Exception as e:
            print(f"Smoothing failed for {ticker}: {e}")
            smoothed_score = combined_score
        
        return smoothed_score, metric_stats

    def build_cycle_indicator(self) -> Tuple[pd.DataFrame, Dict]:
        """Build composite cycle indicator"""
        all_scores = {}
        category_stats = {}
        
        for category, info in self.companies.items():
            category_scores = {}
            category_metrics = {}
            
            for ticker in info['tickers']:
                data = self.fetch_financial_data(ticker)
                if not data.empty:
                    score, metrics = self._process_company_data(data, ticker)
                    if not score.empty:
                        category_scores[ticker] = score
                        category_metrics[ticker] = metrics
            
            if category_scores:
                # Calculate category indicator
                category_df = pd.DataFrame(category_scores)
                category_mean = category_df.mean(axis=1)
                all_scores[f'{category}_indicator'] = category_mean * info['weight']
                
                # Store category stats
                category_stats[category] = {
                    'metrics': category_metrics,
                    'weight': info['weight'],
                    'color': info['color'],
                    'sensitivity': info['cycle_sensitivity']
                }
        
        if all_scores:
            # Build composite indicator
            composite = pd.DataFrame(all_scores)
            composite.index = pd.DatetimeIndex(composite.index)
            composite = composite.sort_index()
            
            # Calculate derived indicators
            composite['composite_score'] = composite.sum(axis=1)
            composite['momentum'] = composite['composite_score'].diff()
            composite['acceleration'] = composite['momentum'].diff()
            
            # Determine cycle phase
            composite['cycle_phase'] = pd.cut(
                composite['composite_score'],
                bins=4,
                labels=['Downturn', 'Early Recovery', 'Expansion', 'Peak']
            )
            
            return composite, category_stats
        
        return pd.DataFrame(), {}

    def add_cycle_annotations(self, fig):
        """Add detailed cycle annotations to the visualization"""
        for period, cycle in self.historical_cycles.items():
            boom_start = pd.to_datetime(cycle['boom'][0])
            boom_end = pd.to_datetime(cycle['boom'][1])
            bust_start = pd.to_datetime(cycle['bust'][0])
            bust_end = pd.to_datetime(cycle['bust'][1])
            
            # Add boom period
            fig.add_vrect(
                x0=boom_start,
                x1=boom_end,
                fillcolor="rgba(0,255,0,0.1)",
                layer="below",
                line_width=0,
                row=1, col=1
            )
            
            # Add bust period
            fig.add_vrect(
                x0=bust_start,
                x1=bust_end,
                fillcolor="rgba(255,0,0,0.1)",
                layer="below",
                line_width=0,
                row=1, col=1
            )
            
            # Add hover annotations with drivers
            boom_text = "<br>".join(cycle['drivers']['boom'])
            bust_text = "<br>".join(cycle['drivers']['bust'])
            
            fig.add_annotation(
                x=boom_start,
                y=1,
                text=f"{period}<br>{cycle['notes']}",
                yref="paper",
                showarrow=False,
                hovertext=f"<b>Boom Drivers:</b><br>{boom_text}",
                hoverlabel=dict(bgcolor="white")
            )
            
            fig.add_annotation(
                x=bust_start,
                y=0.9,
                text="Bust",
                yref="paper",
                showarrow=False,
                hovertext=f"<b>Bust Drivers:</b><br>{bust_text}",
                hoverlabel=dict(bgcolor="white")
            )

    def visualize_cycle(self, composite_data: pd.DataFrame, category_stats: Dict) -> None:
        """Create enhanced interactive visualization"""
        if composite_data.empty:
            print("No data available for visualization")
            return
            
        fig = make_subplots(
            rows=4, cols=1,
            subplot_titles=(
                'Semiconductor Cycle Composite Indicator',
                'Category Contributions',
                'Cycle Momentum and Acceleration',
                'Cycle Phase Distribution'
            ),
            vertical_spacing=0.08,
            row_heights=[0.4, 0.25, 0.2, 0.15]
        )

        # Add historical cycle annotations
        self.add_cycle_annotations(fig)

        # Plot composite score with confidence bands
        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=composite_data['composite_score'],
                name='Composite Score',
                line=dict(color='blue', width=2),
                mode='lines',
                hovertemplate='%{x}<br>Score: %{y:.2f}<extra></extra>'
            ),
            row=1, col=1
        )

        # Add confidence bands
        z_score = 1.96  # 95% confidence interval
        rolling_std = composite_data['composite_score'].rolling(window=8).std()
        upper_bound = composite_data['composite_score'] + (z_score * rolling_std)
        lower_bound = composite_data['composite_score'] - (z_score * rolling_std)

        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=upper_bound,
                fill=None,
                mode='lines',
                line_color='rgba(0,0,255,0.1)',
                name='Upper Bound'
            ),
            row=1, col=1
        )

        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=lower_bound,
                fill='tonexty',
                mode='lines',
                line_color='rgba(0,0,255,0.1)',
                name='Lower Bound'
            ),
            row=1, col=1
        )

        # Plot category contributions
        for category, info in self.companies.items():
            indicator_col = f'{category}_indicator'
            if indicator_col in composite_data.columns:
                fig.add_trace(
                    go.Scatter(
                        x=composite_data.index,
                        y=composite_data[indicator_col],
                        name=f"{category.title()} ({info['cycle_sensitivity']})",
                        line=dict(color=info['color']),
                        stackgroup='categories'
                    ),
                    row=2, col=1
                )

        # Plot momentum and acceleration
        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=composite_data['momentum'],
                name='Momentum',
                line=dict(color='purple'),
                fill='tozeroy'
            ),
            row=3, col=1
        )

        fig.add_trace(
            go.Scatter(
                x=composite_data.index,
                y=composite_data['acceleration'],
                name='Acceleration',
                line=dict(color='orange', dash='dot'),
                fill='tonexty'
            ),
            row=3, col=1
        )

        # Plot cycle phase distribution
        phase_counts = composite_data['cycle_phase'].value_counts()
        fig.add_trace(
            go.Bar(
                x=phase_counts.index,
                y=phase_counts.values,
                name='Cycle Phases',
                marker_color='lightblue'
            ),
            row=4, col=1
        )

        # Update layout
        current_phase = composite_data['cycle_phase'].iloc[-1]
        current_momentum = composite_data['momentum'].iloc[-1]
        momentum_direction = "increasing" if current_momentum > 0 else "decreasing"
        
        fig.update_layout(
            height=1200,
            title={
                'text': f'Semiconductor Industry Cycle Analysis<br>' +
                       f'<sup>Current Phase: {current_phase} | ' +
                       f'Momentum: {momentum_direction} ({current_momentum:.2f})</sup>',
                'y': 0.95,
                'x': 0.5,
                'xanchor': 'center',
                'yanchor': 'top'
            },
            showlegend=True,
            hovermode='x unified',
            template='plotly_white'
        )

        # Update axes
        fig.update_xaxes(title_text="Date", row=4, col=1)
        fig.update_yaxes(title_text="Composite Score", row=1, col=1)
        fig.update_yaxes(title_text="Category Impact", row=2, col=1)
        fig.update_yaxes(title_text="Rate of Change", row=3, col=1)
        fig.update_yaxes(title_text="Count", row=4, col=1)

        # Save visualization and data
        fig.write_html('semi_cycle_visualization.html')
        print("\nVisualization saved as 'semi_cycle_visualization.html'")
        
        composite_data.to_csv('semi_cycle_data.csv')
        print("Cycle data saved as 'semi_cycle_data.csv'")
        
        # Print current status
        print(f"\nCurrent Cycle Status:")
        print(f"Phase: {current_phase}")
        print(f"Momentum: {momentum_direction} ({current_momentum:.2f})")
        print(f"Last Update: {composite_data.index[-1].strftime('%Y-%m-%d')}")

def main():
    """Main function to run the semiconductor cycle analysis"""
    
    # Initialize with your API key
    api_key = "c4ad87b03bec1878bc0be6156d4472b0"  # Replace with your actual API key
    
    try:
        # Create analyzer instance
        print("Initializing Semiconductor Cycle Analyzer...")
        analyzer = SemiCycleAnalyzer(api_key)
        
        # Test API connection
        print("\nTesting API connection...")
        test_data = analyzer._fetch_data('/income-statement/AAPL?period=quarter&limit=1')
        if not test_data:
            print("Error: API connection failed. Please check your API key and internet connection.")
            return
        
        print("API connection successful. Fetching data...")
        
        # Build cycle indicator
        composite_data, category_stats = analyzer.build_cycle_indicator()
        
        if not composite_data.empty:
            print("\nData processing complete. Generating visualization...")
            analyzer.visualize_cycle(composite_data, category_stats)
        else:
            print("\nError: No data available for visualization")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        raise

if __name__ == "__main__":
    main()
        