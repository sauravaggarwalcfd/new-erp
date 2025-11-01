import requests
import sys
import json
from datetime import datetime

class GarmentERPTester:
    def __init__(self, base_url="https://garment-app.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Store created IDs for cleanup and testing
        self.created_ids = {
            'buyers': [],
            'suppliers': [],
            'materials': [],
            'colors': [],
            'sizes': [],
            'articles': [],
            'boms': [],
            'mrps': []
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                if response.text:
                    try:
                        error_data = response.json()
                        details += f", Error: {error_data.get('detail', response.text[:100])}"
                    except:
                        details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success and response.text:
                try:
                    return response.json()
                except:
                    return {}
            return {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return {}

    def test_user_registration(self):
        """Test user registration with different roles"""
        print("\n🔍 Testing User Registration...")
        
        # Test admin registration
        admin_data = {
            "username": f"admin_{datetime.now().strftime('%H%M%S')}",
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "AdminPass123!",
            "role": "admin"
        }
        
        response = self.run_test(
            "Register Admin User",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            return True
        
        return False

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "AdminPass123!"
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return 'access_token' in response

    def test_auth_me(self):
        """Test get current user"""
        print("\n🔍 Testing Auth Me...")
        
        response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return 'id' in response

    def test_buyers_crud(self):
        """Test Buyers CRUD operations"""
        print("\n🔍 Testing Buyers CRUD...")
        
        # Create buyer
        buyer_data = {
            "name": "Test Buyer Ltd",
            "contact_person": "John Doe",
            "email": "john@testbuyer.com",
            "phone": "+1234567890",
            "address": "123 Business St, City"
        }
        
        response = self.run_test(
            "Create Buyer",
            "POST",
            "buyers",
            200,
            data=buyer_data
        )
        
        if response and 'id' in response:
            buyer_id = response['id']
            self.created_ids['buyers'].append(buyer_id)
            
            # Get all buyers
            self.run_test(
                "Get All Buyers",
                "GET",
                "buyers",
                200
            )
            
            # Update buyer
            updated_data = buyer_data.copy()
            updated_data['name'] = "Updated Test Buyer Ltd"
            
            self.run_test(
                "Update Buyer",
                "PUT",
                f"buyers/{buyer_id}",
                200,
                data=updated_data
            )
            
            return True
        
        return False

    def test_suppliers_crud(self):
        """Test Suppliers CRUD operations"""
        print("\n🔍 Testing Suppliers CRUD...")
        
        # Create supplier
        supplier_data = {
            "name": "Test Fabric Supplier",
            "contact_person": "Jane Smith",
            "email": "jane@supplier.com",
            "phone": "+1234567891",
            "address": "456 Supplier Ave, City",
            "material_type": "fabric"
        }
        
        response = self.run_test(
            "Create Supplier",
            "POST",
            "suppliers",
            200,
            data=supplier_data
        )
        
        if response and 'id' in response:
            supplier_id = response['id']
            self.created_ids['suppliers'].append(supplier_id)
            
            # Get all suppliers
            self.run_test(
                "Get All Suppliers",
                "GET",
                "suppliers",
                200
            )
            
            return True
        
        return False

    def test_raw_materials_crud(self):
        """Test Raw Materials CRUD operations"""
        print("\n🔍 Testing Raw Materials CRUD...")
        
        # Create raw material
        material_data = {
            "name": "Cotton Fabric",
            "code": "COT001",
            "material_type": "fabric",
            "unit": "meters",
            "cost_per_unit": 25.50,
            "supplier_id": self.created_ids['suppliers'][0] if self.created_ids['suppliers'] else None
        }
        
        response = self.run_test(
            "Create Raw Material",
            "POST",
            "raw-materials",
            200,
            data=material_data
        )
        
        if response and 'id' in response:
            material_id = response['id']
            self.created_ids['materials'].append(material_id)
            
            # Get all materials
            self.run_test(
                "Get All Raw Materials",
                "GET",
                "raw-materials",
                200
            )
            
            return True
        
        return False

    def test_colors_crud(self):
        """Test Colors CRUD operations"""
        print("\n🔍 Testing Colors CRUD...")
        
        # Create color
        color_data = {
            "name": "Navy Blue",
            "code": "NB001",
            "hex_value": "#000080"
        }
        
        response = self.run_test(
            "Create Color",
            "POST",
            "colors",
            200,
            data=color_data
        )
        
        if response and 'id' in response:
            color_id = response['id']
            self.created_ids['colors'].append(color_id)
            
            # Get all colors
            self.run_test(
                "Get All Colors",
                "GET",
                "colors",
                200
            )
            
            return True
        
        return False

    def test_sizes_crud(self):
        """Test Sizes CRUD operations"""
        print("\n🔍 Testing Sizes CRUD...")
        
        # Create size
        size_data = {
            "name": "Medium",
            "code": "M",
            "sort_order": 2
        }
        
        response = self.run_test(
            "Create Size",
            "POST",
            "sizes",
            200,
            data=size_data
        )
        
        if response and 'id' in response:
            size_id = response['id']
            self.created_ids['sizes'].append(size_id)
            
            # Get all sizes
            self.run_test(
                "Get All Sizes",
                "GET",
                "sizes",
                200
            )
            
            return True
        
        return False

    def test_articles_crud(self):
        """Test Articles CRUD operations"""
        print("\n🔍 Testing Articles CRUD...")
        
        # Create article
        article_data = {
            "name": "T-Shirt Basic",
            "code": "TS001",
            "description": "Basic cotton t-shirt",
            "buyer_id": self.created_ids['buyers'][0] if self.created_ids['buyers'] else None
        }
        
        response = self.run_test(
            "Create Article",
            "POST",
            "articles",
            200,
            data=article_data
        )
        
        if response and 'id' in response:
            article_id = response['id']
            self.created_ids['articles'].append(article_id)
            
            # Get all articles
            self.run_test(
                "Get All Articles",
                "GET",
                "articles",
                200
            )
            
            return True
        
        return False

    def test_bom_creation(self):
        """Test BOM creation"""
        print("\n🔍 Testing BOM Creation...")
        
        if not (self.created_ids['articles'] and self.created_ids['colors'] and self.created_ids['materials']):
            self.log_test("BOM Creation", False, "Missing required master data")
            return False
        
        # Create BOM
        bom_data = {
            "article_id": self.created_ids['articles'][0],
            "color_id": self.created_ids['colors'][0],
            "items": [
                {
                    "material_id": self.created_ids['materials'][0],
                    "material_name": "Cotton Fabric",
                    "avg_consumption": 2.5,
                    "wastage_percent": 10.0,
                    "total_consumption": 2.75,
                    "cost_per_unit": 25.50,
                    "total_cost": 70.125
                }
            ]
        }
        
        response = self.run_test(
            "Create BOM",
            "POST",
            "boms",
            200,
            data=bom_data
        )
        
        if response and 'id' in response:
            bom_id = response['id']
            self.created_ids['boms'].append(bom_id)
            
            # Get all BOMs
            self.run_test(
                "Get All BOMs",
                "GET",
                "boms",
                200
            )
            
            # Get unassigned BOMs
            self.run_test(
                "Get Unassigned BOMs",
                "GET",
                "boms?status=unassigned",
                200
            )
            
            # Get specific BOM
            self.run_test(
                "Get Specific BOM",
                "GET",
                f"boms/{bom_id}",
                200
            )
            
            return True
        
        return False

    def test_mrp_creation(self):
        """Test MRP creation"""
        print("\n🔍 Testing MRP Creation...")
        
        if not self.created_ids['boms']:
            self.log_test("MRP Creation", False, "No BOMs available")
            return False
        
        # Create MRP
        mrp_data = {
            "bom_ids": [self.created_ids['boms'][0]]
        }
        
        response = self.run_test(
            "Create MRP",
            "POST",
            "mrps",
            200,
            data=mrp_data
        )
        
        if response and 'id' in response:
            mrp_id = response['id']
            self.created_ids['mrps'].append(mrp_id)
            
            # Verify MRP number format
            if 'mrp_number' in response and response['mrp_number'].startswith('MRP-'):
                self.log_test("MRP Number Format", True, f"Generated: {response['mrp_number']}")
            else:
                self.log_test("MRP Number Format", False, "Invalid format")
            
            # Get all MRPs
            self.run_test(
                "Get All MRPs",
                "GET",
                "mrps",
                200
            )
            
            # Get specific MRP
            self.run_test(
                "Get Specific MRP",
                "GET",
                f"mrps/{mrp_id}",
                200
            )
            
            return True
        
        return False

    def test_delete_operations(self):
        """Test delete operations"""
        print("\n🔍 Testing Delete Operations...")
        
        # Delete MRP (should unassign BOMs)
        if self.created_ids['mrps']:
            self.run_test(
                "Delete MRP",
                "DELETE",
                f"mrps/{self.created_ids['mrps'][0]}",
                200
            )
        
        # Delete BOM
        if self.created_ids['boms']:
            self.run_test(
                "Delete BOM",
                "DELETE",
                f"boms/{self.created_ids['boms'][0]}",
                200
            )
        
        # Delete other entities
        for entity, ids in self.created_ids.items():
            if entity in ['mrps', 'boms'] or not ids:
                continue
                
            endpoint = entity.replace('_', '-')  # raw_materials -> raw-materials
            self.run_test(
                f"Delete {entity.title()}",
                "DELETE",
                f"{endpoint}/{ids[0]}",
                200
            )

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Garment ERP Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
        
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
        
        if not self.test_auth_me():
            print("❌ Auth verification failed")
        
        # Master data tests
        self.test_buyers_crud()
        self.test_suppliers_crud()
        self.test_raw_materials_crud()
        self.test_colors_crud()
        self.test_sizes_crud()
        self.test_articles_crud()
        
        # BOM and MRP tests
        self.test_bom_creation()
        self.test_mrp_creation()
        
        # Cleanup tests
        self.test_delete_operations()
        
        # Print results
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = GarmentERPTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())