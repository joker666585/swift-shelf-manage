-- Create package status enum
CREATE TYPE public.package_status AS ENUM ('in_stock', 'out_for_delivery', 'pending', 'delivered', 'signed', 'deleted');

-- Create shipment status enum
CREATE TYPE public.shipment_status AS ENUM ('pending', 'shipped', 'delivered');

-- Create shelves table
CREATE TABLE public.shelves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  current_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packages table
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  owner TEXT,
  shelf TEXT,
  tags TEXT[] DEFAULT '{}',
  status public.package_status NOT NULL DEFAULT 'in_stock',
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  weight DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  recipient_address TEXT NOT NULL,
  recipient_country TEXT,
  recipient_zip_code TEXT,
  shipment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.shipment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for shipment packages
CREATE TABLE public.shipment_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shipment_id, package_id)
);

-- Create owners table
CREATE TABLE public.owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price channels table
CREATE TABLE public.price_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  country TEXT NOT NULL,
  weight_range TEXT,
  billing_method TEXT,
  first_weight DECIMAL(10, 2) DEFAULT 0,
  additional_weight DECIMAL(10, 2) DEFAULT 0,
  unit TEXT,
  time_frame TEXT,
  notes TEXT,
  tier_pricing JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_channels ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (for now, without auth)
-- Shelves policies
CREATE POLICY "Allow public read access to shelves" ON public.shelves FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to shelves" ON public.shelves FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to shelves" ON public.shelves FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to shelves" ON public.shelves FOR DELETE USING (true);

-- Packages policies
CREATE POLICY "Allow public read access to packages" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to packages" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to packages" ON public.packages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to packages" ON public.packages FOR DELETE USING (true);

-- Shipments policies
CREATE POLICY "Allow public read access to shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to shipments" ON public.shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to shipments" ON public.shipments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to shipments" ON public.shipments FOR DELETE USING (true);

-- Shipment packages policies
CREATE POLICY "Allow public read access to shipment_packages" ON public.shipment_packages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to shipment_packages" ON public.shipment_packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access to shipment_packages" ON public.shipment_packages FOR DELETE USING (true);

-- Owners policies
CREATE POLICY "Allow public read access to owners" ON public.owners FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to owners" ON public.owners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to owners" ON public.owners FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to owners" ON public.owners FOR DELETE USING (true);

-- Tags policies
CREATE POLICY "Allow public read access to tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tags" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to tags" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to tags" ON public.tags FOR DELETE USING (true);

-- Price channels policies
CREATE POLICY "Allow public read access to price_channels" ON public.price_channels FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to price_channels" ON public.price_channels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to price_channels" ON public.price_channels FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to price_channels" ON public.price_channels FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_shelves_updated_at BEFORE UPDATE ON public.shelves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_price_channels_updated_at BEFORE UPDATE ON public.price_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default shelves
INSERT INTO public.shelves (name, location, capacity, current_count) VALUES
  ('A1', 'A区1号', 100, 0),
  ('A2', 'A区2号', 100, 0),
  ('B1', 'B区1号', 100, 0),
  ('B2', 'B区2号', 100, 0);

-- Insert default owners
INSERT INTO public.owners (name) VALUES ('张三'), ('李四'), ('王五');

-- Insert default tags
INSERT INTO public.tags (name) VALUES ('紧急'), ('易碎'), ('重要'), ('普通');

-- Insert default price channels
INSERT INTO public.price_channels (channel, country, weight_range, billing_method, first_weight, additional_weight, unit, time_frame, notes) VALUES
  ('美国DHL空运', '美国', '0.5-20kg', '首重+续重', 165, 35, '0.5kg', '3-5工作日', '21-51kg每kg65元，52-101kg每kg60元'),
  ('美国USPS小包', '美国', '0.1-0.5kg', '重量计费+操作费', 100, 0, '公斤', '7-15工作日', '100元/kg+30元操作费'),
  ('美国亚马逊海运', '美国', '12-200kg', '阶梯计费', 0, 0, 'kg', '20-30工作日', '阶梯计费模式');