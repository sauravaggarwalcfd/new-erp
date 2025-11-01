import requests
import json
from datetime import datetime

class FocusedBOMTester:
    def __init__(self, base_url="https://garment-app.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        if success:
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def authenticate(self):
        """Quick authentication"""
        # Register a test user
        user_data = {
            "username": f"test_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "admin"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=user_data, timeout=30)
        if response.status_code == 200:
            data = response.json()
            self.token = data['access_token']
            return True
        return False

    def test_comprehensive_bom_creation(self):
        """Test Case 1: Create BOM with complete data"""
        print("\n🔍 Test Case 1: Create BOM with complete data")
        
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        bom_data = {
            "header": {
                "date": "2025-11-01",
                "artNo": "ART001",
                "styleNumber": "STY001",
                "buyer": "Test Buyer",
                "planQty": "1000",
                "setNo": "SET001",
                "imageReference": "IMG001",
                "remarks": "Test BOM"
            },
            "fabricTables": [
                {
                    "id": 1,
                    "name": "BOM Table 1",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Combo A",
                            "lotNo": "L001",
                            "lotCount": "10",
                            "colour": "Red",
                            "fabricQuality": "Cotton 100%",
                            "orderPcs": "100",
                            "planRat": "1.5"
                        }
                    ]
                }
            ],
            "trimsTables": [
                {
                    "id": 1,
                    "name": "Trims for BOM Table 1",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Combo A",
                            "trimType": "Button",
                            "itemName": "Metal Button",
                            "itemCode": "BTN001",
                            "quantity": "5",
                            "unitPrice": "2.50"
                        }
                    ]
                }
            ],
            "operations": [
                {
                    "srNo": 1,
                    "operationName": "Cutting",
                    "department": "Cutting",
                    "sam": "2.5",
                    "workers": "2",
                    "costPerPiece": "5.00"
                }
            ]
        }
        
        response = requests.post(f"{self.base_url}/boms/comprehensive", json=bom_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'bom_id' in data:
                self.log_test("POST /api/boms/comprehensive - 200 response", True, f"BOM ID: {data['bom_id']}")
                if 'message' in data and 'successfully' in data['message']:
                    self.log_test("Success message verification", True, data['message'])
                else:
                    self.log_test("Success message verification", False, "Missing success message")
                return data['bom_id']
            else:
                self.log_test("POST /api/boms/comprehensive - bom_id", False, "Missing bom_id in response")
        else:
            self.log_test("POST /api/boms/comprehensive", False, f"Status: {response.status_code}")
        
        return None

    def test_bom_retrieval(self, bom_id):
        """Test Case 2: Retrieve BOMs"""
        print("\n🔍 Test Case 2: Retrieve BOMs")
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        response = requests.get(f"{self.base_url}/boms", headers=headers, timeout=30)
        
        if response.status_code == 200:
            boms = response.json()
            self.log_test("GET /api/boms - 200 response", True, f"Found {len(boms)} BOMs")
            
            # Find our BOM in the list
            found_bom = None
            for bom in boms:
                if bom.get('id') == bom_id:
                    found_bom = bom
                    break
            
            if found_bom:
                self.log_test("Created BOM in list", True, f"BOM ID: {bom_id}")
                
                # Check required fields
                required_fields = ['fabricTables', 'trimsTables', 'operations']
                missing_fields = []
                for field in required_fields:
                    if field not in found_bom:
                        missing_fields.append(field)
                
                if not missing_fields:
                    self.log_test("Required fields present", True, "fabricTables, trimsTables, operations")
                else:
                    self.log_test("Required fields present", False, f"Missing: {missing_fields}")
                
                # Check status
                if found_bom.get('status') == 'assigned':
                    self.log_test("Status is 'assigned'", True)
                else:
                    self.log_test("Status is 'assigned'", False, f"Status: {found_bom.get('status')}")
                
                return True
            else:
                self.log_test("Created BOM in list", False, f"BOM {bom_id} not found")
        else:
            self.log_test("GET /api/boms", False, f"Status: {response.status_code}")
        
        return False

    def test_multiple_tables(self):
        """Test Case 3: Multiple FABRIC and TRIMS tables"""
        print("\n🔍 Test Case 3: Multiple FABRIC and TRIMS tables")
        
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        multi_table_data = {
            "header": {
                "date": "2025-11-01",
                "artNo": "ART002",
                "styleNumber": "STY002",
                "buyer": "Multi Table Buyer",
                "planQty": "2000",
                "setNo": "SET002",
                "imageReference": "IMG002",
                "remarks": "Multi-table test"
            },
            "fabricTables": [
                {
                    "id": 1,
                    "name": "Main Fabric",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Main Combo",
                            "lotNo": "ML001",
                            "lotCount": "20",
                            "colour": "Blue",
                            "fabricQuality": "Cotton",
                            "orderPcs": "200",
                            "planRat": "2.0"
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "Contrast Fabric",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Contrast Combo",
                            "lotNo": "CL001",
                            "lotCount": "5",
                            "colour": "White",
                            "fabricQuality": "Polyester",
                            "orderPcs": "50",
                            "planRat": "0.5"
                        }
                    ]
                }
            ],
            "trimsTables": [
                {
                    "id": 1,
                    "name": "Trims for Main Fabric",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Main Combo",
                            "trimType": "Zipper",
                            "itemName": "YKK Zipper",
                            "itemCode": "ZIP001",
                            "quantity": "1",
                            "unitPrice": "15.00"
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "Trims for Contrast Fabric",
                    "items": [
                        {
                            "srNo": 1,
                            "comboName": "Contrast Combo",
                            "trimType": "Button",
                            "itemName": "Plastic Button",
                            "itemCode": "BTN002",
                            "quantity": "3",
                            "unitPrice": "1.00"
                        }
                    ]
                }
            ],
            "operations": [
                {
                    "srNo": 1,
                    "operationName": "Cutting",
                    "department": "Cutting",
                    "sam": "3.0",
                    "workers": "2",
                    "costPerPiece": "6.00"
                },
                {
                    "srNo": 2,
                    "operationName": "Sewing",
                    "department": "Production",
                    "sam": "12.0",
                    "workers": "4",
                    "costPerPiece": "10.00"
                }
            ]
        }
        
        response = requests.post(f"{self.base_url}/boms/comprehensive", json=multi_table_data, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if 'bom_id' in data:
                multi_bom_id = data['bom_id']
                self.log_test("Create multi-table BOM", True, f"BOM ID: {multi_bom_id}")
                
                # Retrieve and verify
                get_response = requests.get(f"{self.base_url}/boms", headers={'Authorization': f'Bearer {self.token}'}, timeout=30)
                if get_response.status_code == 200:
                    boms = get_response.json()
                    found_bom = None
                    for bom in boms:
                        if bom.get('id') == multi_bom_id:
                            found_bom = bom
                            break
                    
                    if found_bom:
                        fabric_tables = found_bom.get('fabricTables', [])
                        trims_tables = found_bom.get('trimsTables', [])
                        
                        if len(fabric_tables) == 2:
                            self.log_test("2 FABRIC tables saved", True)
                        else:
                            self.log_test("2 FABRIC tables saved", False, f"Found {len(fabric_tables)}")
                        
                        if len(trims_tables) == 2:
                            self.log_test("2 TRIMS tables saved", True)
                        else:
                            self.log_test("2 TRIMS tables saved", False, f"Found {len(trims_tables)}")
                        
                        return True
                    else:
                        self.log_test("Retrieve multi-table BOM", False, "BOM not found")
                else:
                    self.log_test("Retrieve multi-table BOM", False, f"Status: {get_response.status_code}")
            else:
                self.log_test("Create multi-table BOM", False, "Missing bom_id")
        else:
            self.log_test("Create multi-table BOM", False, f"Status: {response.status_code}")
        
        return False

    def run_focused_tests(self):
        """Run the focused BOM tests"""
        print("🚀 Starting Focused Comprehensive BOM Tests...")
        print(f"Testing against: {self.base_url}")
        
        if not self.authenticate():
            print("❌ Authentication failed")
            return False
        
        # Test Case 1: Create BOM with complete data
        bom_id = self.test_comprehensive_bom_creation()
        
        # Test Case 2: Retrieve BOMs
        if bom_id:
            self.test_bom_retrieval(bom_id)
        
        # Test Case 3: Multiple tables
        self.test_multiple_tables()
        
        # Print summary
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        print(f"\n📊 Focused Test Results: {passed}/{total} passed")
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return passed == total

def main():
    tester = FocusedBOMTester()
    success = tester.run_focused_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main())