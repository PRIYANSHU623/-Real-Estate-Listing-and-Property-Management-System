"""Database seed script for EstateHub Real Estate & Property Management platform."""
import asyncio
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from app.db import base
from app.db.session import engine, AsyncSessionLocal
from app.core.security import hash_password
from app.core.constants import (
    UserRole,
    PropertyType,
    PropertyStatus,
    BookingStatus,
    LeaseStatus,
    PaymentStatus,
    PaymentPurpose,
    TicketPriority,
    TicketStatus,
    NotificationType,
)
from app.models.user import User
from app.models.property import Property
from app.models.booking import Booking
from app.models.lease import Lease
from app.models.payment import Payment
from app.models.maintenance import MaintenanceTicket
from app.models.vendor import Vendor
from app.models.notification import Notification

async def seed():
    print("Creating tables if not exists...")
    async with engine.begin() as conn:
        await conn.run_sync(base.Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if users already exist
        existing_owner = await User.get_by_email(db, "owner@estatehub.com")
        if existing_owner:
            print("Database already seeded. Skipping seed.")
            return

        print("Seeding demo users...")
        pw = hash_password("Password123!")

        owner1 = User(name="Vikram Malhotra", email="owner@estatehub.com", phone="9876543210", password_hash=pw, role=UserRole.OWNER, is_active=True)
        owner2 = User(name="Pooja Singhania", email="pooja@singhania.com", phone="9876543213", password_hash=pw, role=UserRole.OWNER, is_active=True)
        tenant1 = User(name="Aanya Sharma", email="tenant@estatehub.com", phone="9876543211", password_hash=pw, role=UserRole.TENANT, is_active=True)
        tenant2 = User(name="Rohan Verma", email="rohan.verma@gmail.com", phone="9876543214", password_hash=pw, role=UserRole.TENANT, is_active=True)
        admin = User(name="System Administrator", email="admin@estatehub.com", phone="9876543212", password_hash=pw, role=UserRole.ADMIN, is_active=True)

        db.add_all([owner1, owner2, tenant1, tenant2, admin])
        await db.flush()

        print("Seeding maintenance vendors...")
        vendors = [
            Vendor(name="CoolAir HVAC Solutions", phone="9820011223", email="support@coolair.in", service_type="HVAC & Air Conditioning", is_active=True),
            Vendor(name="Apex Rapid Plumbing", phone="9820033445", email="help@apexplumb.in", service_type="Plumbing", is_active=True),
            Vendor(name="SparkPro Electricals", phone="9820055667", email="contact@sparkpro.in", service_type="Electrical", is_active=True),
            Vendor(name="WoodCraft Carpentry Works", phone="9820077889", email="orders@woodcraft.in", service_type="Carpentry & Woodwork", is_active=True),
            Vendor(name="PureClean Sanitization Services", phone="9820099001", email="care@pureclean.in", service_type="Deep Cleaning & Sanitization", is_active=True),
        ]
        db.add_all(vendors)
        await db.flush()

        print("Seeding properties...")
        properties = [
            Property(
                owner_id=owner1.id,
                title="The Grand Seafront 3BHK Penthouse",
                description="Ultra-luxurious sea-facing apartment on the 18th floor with wrap-around balconies, modular Italian kitchen, smart home automation, and 2 dedicated underground parking bays. 24/7 security concierge.",
                property_type=PropertyType.APARTMENT,
                address="1802, Ocean Crest, Carter Road, Bandra West",
                city="Mumbai",
                state="Maharashtra",
                pincode="400050",
                latitude=Decimal("19.0620"),
                longitude=Decimal("72.8258"),
                rent=Decimal("125000.00"),
                bedrooms=3,
                bathrooms=3,
                area=Decimal("2100.00"),
                status=PropertyStatus.AVAILABLE,
            ),
            Property(
                owner_id=owner1.id,
                title="Greenwood Garden Villa with Private Pool",
                description="Serene 4BHK standalone villa surrounded by landscaped greens. Features a private plunge pool, sun terrace, double-height living room, modular wardrobes, and solar power backup.",
                property_type=PropertyType.VILLA,
                address="Villa 14, Palm Meadows, Whitefield",
                city="Bengaluru",
                state="Karnataka",
                pincode="560066",
                latitude=Decimal("12.9698"),
                longitude=Decimal("77.7499"),
                rent=Decimal("95000.00"),
                bedrooms=4,
                bathrooms=4,
                area=Decimal("3400.00"),
                status=PropertyStatus.OCCUPIED,
            ),
            Property(
                owner_id=owner1.id,
                title="Skyline Urban 2BHK Designer Flat",
                description="Vibrant and airy 2BHK flat featuring expansive windows, wooden flooring in master bedroom, piped natural gas, clubhouse access, swimming pool and fitness gym.",
                property_type=PropertyType.APARTMENT,
                address="904, Tower B, Amanora Park Town, Hadapsar",
                city="Pune",
                state="Maharashtra",
                pincode="411028",
                latitude=Decimal("18.5140"),
                longitude=Decimal("73.9350"),
                rent=Decimal("42000.00"),
                bedrooms=2,
                bathrooms=2,
                area=Decimal("1180.00"),
                status=PropertyStatus.BOOKED,
            ),
            Property(
                owner_id=owner2.id,
                title="Modernist Studio Loft in Cyber City",
                description="Compact and stylish studio designed for working professionals. Fully furnished with high-speed fiber connection, ergonomic work desk, smart TV, microwave, and washer-dryer.",
                property_type=PropertyType.STUDIO,
                address="Flat 302, DLF Phase 2, Near Cyber City",
                city="Delhi",
                state="Delhi",
                pincode="122002",
                latitude=Decimal("28.4890"),
                longitude=Decimal("77.0890"),
                rent=Decimal("28000.00"),
                bedrooms=1,
                bathrooms=1,
                area=Decimal("580.00"),
                status=PropertyStatus.AVAILABLE,
            ),
            Property(
                owner_id=owner2.id,
                title="Regal Gated Independent Bungalow",
                description="Classic colonial-inspired 5BHK independent house with private lawn, servant quarters, three-car garage, and borewell water. Located in a tranquil, prestigious avenue.",
                property_type=PropertyType.HOUSE,
                address="44, Jubilee Hills, Road No. 36",
                city="Hyderabad",
                state="Telangana",
                pincode="500033",
                latitude=Decimal("17.4319"),
                longitude=Decimal("78.4073"),
                rent=Decimal("165000.00"),
                bedrooms=5,
                bathrooms=5,
                area=Decimal("4600.00"),
                status=PropertyStatus.AVAILABLE,
            ),
            Property(
                owner_id=owner2.id,
                title="Coastal Breeze 3BHK by the Marina",
                description="Breathtaking ocean views, marble flooring, high ceilings, centralized VRV air conditioning, and seamless connectivity to the metro corridor and beach boardwalk.",
                property_type=PropertyType.APARTMENT,
                address="7B, Bayview Residency, ECR Thiruvanmiyur",
                city="Chennai",
                state="Tamil Nadu",
                pincode="600041",
                latitude=Decimal("12.9830"),
                longitude=Decimal("80.2590"),
                rent=Decimal("58000.00"),
                bedrooms=3,
                bathrooms=3,
                area=Decimal("1750.00"),
                status=PropertyStatus.AVAILABLE,
            ),
            Property(
                owner_id=owner1.id,
                title="Prime High-Street Commercial Showroom",
                description="Double-frontage corner commercial space ideal for flagship retail stores, clinics, or corporate offices. Ample customer parking and 3-phase heavy power line.",
                property_type=PropertyType.COMMERCIAL,
                address="Shop 1-2, Ground Floor, Indiranagar 100ft Road",
                city="Bengaluru",
                state="Karnataka",
                pincode="560038",
                latitude=Decimal("12.9784"),
                longitude=Decimal("77.6408"),
                rent=Decimal("180000.00"),
                bedrooms=0,
                bathrooms=2,
                area=Decimal("2400.00"),
                status=PropertyStatus.AVAILABLE,
            ),
            Property(
                owner_id=owner1.id,
                title="Cozy 1BHK Terrace Apartment",
                description="Charming top-floor 1BHK with an exclusive 400 sq.ft private terrace. Ideal for singles or couples wanting greenery and open skies in the heart of Mumbai.",
                property_type=PropertyType.APARTMENT,
                address="501, Shanti Niketan, Juhu Tara Road",
                city="Mumbai",
                state="Maharashtra",
                pincode="400049",
                latitude=Decimal("19.0988"),
                longitude=Decimal("72.8264"),
                rent=Decimal("45000.00"),
                bedrooms=1,
                bathrooms=1,
                area=Decimal("750.00"),
                status=PropertyStatus.AVAILABLE,
            ),
        ]
        db.add_all(properties)
        await db.flush()

        print("Seeding active leases & bookings...")
        today = date.today()

        # Lease for tenant1 on property 2
        lease1 = Lease(
            property_id=properties[1].id,
            tenant_id=tenant1.id,
            owner_id=owner1.id,
            start_date=today - timedelta(days=90),
            end_date=today + timedelta(days=275),
            monthly_rent=Decimal("95000.00"),
            security_deposit=Decimal("190000.00"),
            status=LeaseStatus.ACTIVE,
            agreement_url="https://estatehub.com/agreements/sample-lease-whitefield.pdf",
        )
        db.add(lease1)
        await db.flush()

        # Booking for tenant1 on property 1
        booking1 = Booking(
            property_id=properties[0].id,
            tenant_id=tenant1.id,
            booking_date=today + timedelta(days=3),
            status=BookingStatus.PENDING,
            message="Hi Vikram, I would love to schedule a visit this Saturday at 3 PM.",
        )
        # Booking for tenant2 on property 2
        booking2 = Booking(
            property_id=properties[2].id,
            tenant_id=tenant2.id,
            booking_date=today + timedelta(days=5),
            status=BookingStatus.CONFIRMED,
            message="Confirmed inspection for Sunday morning.",
        )
        db.add_all([booking1, booking2])
        await db.flush()

        print("Seeding payments...")
        pay1 = Payment(
            tenant_id=tenant1.id,
            property_id=properties[1].id,
            lease_id=lease1.id,
            amount=Decimal("190000.00"),
            currency="INR",
            purpose=PaymentPurpose.SECURITY_DEPOSIT,
            razorpay_order_id="order_demo_deposit_001",
            razorpay_payment_id="pay_demo_deposit_001",
            status=PaymentStatus.PAID,
            payment_date=datetime.now(timezone.utc) - timedelta(days=88),
        )
        pay2 = Payment(
            tenant_id=tenant1.id,
            property_id=properties[1].id,
            lease_id=lease1.id,
            amount=Decimal("95000.00"),
            currency="INR",
            purpose=PaymentPurpose.RENT,
            razorpay_order_id="order_demo_rent_oct",
            razorpay_payment_id="pay_demo_rent_oct",
            status=PaymentStatus.PAID,
            payment_date=datetime.now(timezone.utc) - timedelta(days=30),
        )
        db.add_all([pay1, pay2])

        print("Seeding maintenance tickets...")
        ticket1 = MaintenanceTicket(
            property_id=properties[1].id,
            tenant_id=tenant1.id,
            vendor_id=vendors[0].id,
            title="Living room cassette AC fan humming sound",
            description="The Daikin cassette AC in the main hall began making a humming noise when set to low cooling.",
            priority=TicketPriority.MEDIUM,
            status=TicketStatus.IN_PROGRESS,
        )
        ticket2 = MaintenanceTicket(
            property_id=properties[1].id,
            tenant_id=tenant1.id,
            vendor_id=vendors[1].id,
            title="Kitchen sink water pressure low",
            description="Water pressure from the mixer faucet has dropped since yesterday morning.",
            priority=TicketPriority.LOW,
            status=TicketStatus.OPEN,
        )
        db.add_all([ticket1, ticket2])

        print("Seeding notifications...")
        notifications = [
            Notification(
                user_id=owner1.id,
                title="New booking inquiry",
                message=f"Aanya Sharma scheduled a visit for '{properties[0].title}'.",
                type=NotificationType.BOOKING,
                is_read=False,
            ),
            Notification(
                user_id=owner1.id,
                title="Rent payment captured",
                message="₹95,000 received via Razorpay for Greenwood Garden Villa.",
                type=NotificationType.PAYMENT,
                is_read=True,
            ),
            Notification(
                user_id=tenant1.id,
                title="Maintenance in progress",
                message="CoolAir HVAC Solutions technician has been dispatched for your AC ticket.",
                type=NotificationType.MAINTENANCE,
                is_read=False,
            ),
        ]
        db.add_all(notifications)

        await db.commit()
        print("Database seeded with sample data successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
