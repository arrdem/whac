package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public abstract class Weapon implements Serializable {

	/** serial */
	private static final long serialVersionUID = 122020575680122911L;

	private String name;
	
	/** the number of times the model has the weapon */
	private int count;
	
	private boolean magical;
	private boolean fire;
	private boolean frost;
	private boolean electricity;
	private boolean corrosion;
	
	private boolean criticalFire;
	private boolean criticalFrost;
	private boolean criticalElectricity;
	private boolean criticalCorrosion;

	private boolean continuousFire;
	private boolean continuousFrost;
	private boolean continuousElectricity;
	private boolean continuousCorrosion;
	
	private boolean weaponMaster;
	
	/** for warjacks only */
	private String location;
	
	private List<Capacity> capacities = new ArrayList<Capacity>();
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public boolean isMagical() {
		return magical;
	}
	public void setMagical(boolean magical) {
		this.magical = magical;
	}
	public boolean isFire() {
		return fire;
	}
	public void setFire(boolean fire) {
		this.fire = fire;
	}
	public boolean isFrost() {
		return frost;
	}
	public void setFrost(boolean frost) {
		this.frost = frost;
	}
	public boolean isElectricity() {
		return electricity;
	}
	public void setElectricity(boolean electricity) {
		this.electricity = electricity;
	}
	public boolean isCorrosion() {
		return corrosion;
	}
	public void setCorrosion(boolean corrosion) {
		this.corrosion = corrosion;
	}
	public boolean isCriticalFire() {
		return criticalFire;
	}
	public void setCriticalFire(boolean criticalFire) {
		this.criticalFire = criticalFire;
	}
	public boolean isCriticalFrost() {
		return criticalFrost;
	}
	public void setCriticalFrost(boolean criticalFrost) {
		this.criticalFrost = criticalFrost;
	}
	public boolean isCriticalElectricity() {
		return criticalElectricity;
	}
	public void setCriticalElectricity(boolean criticalElectricity) {
		this.criticalElectricity = criticalElectricity;
	}
	public boolean isCriticalCorrosion() {
		return criticalCorrosion;
	}
	public void setCriticalCorrosion(boolean criticalCorrosion) {
		this.criticalCorrosion = criticalCorrosion;
	}
	public boolean isContinuousFire() {
		return continuousFire;
	}
	public void setContinuousFire(boolean continuousFire) {
		this.continuousFire = continuousFire;
	}
	public boolean isContinuousFrost() {
		return continuousFrost;
	}
	public void setContinuousFrost(boolean continuousFrost) {
		this.continuousFrost = continuousFrost;
	}
	public boolean isContinuousElectricity() {
		return continuousElectricity;
	}
	public void setContinuousElectricity(boolean continuousElectricity) {
		this.continuousElectricity = continuousElectricity;
	}
	public boolean isContinuousCorrosion() {
		return continuousCorrosion;
	}
	public void setContinuousCorrosion(boolean continuousCorrosion) {
		this.continuousCorrosion = continuousCorrosion;
	}
	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}

	public boolean hasLocation() {
		if (location != null && location.length() > 0) {
			return true;
		}
		return false;
	}
	public List<Capacity> getCapacities() {
		return capacities;
	}
	public void setCapacities(List<Capacity> capacities) {
		this.capacities = capacities;
	}
	public boolean isWeaponMaster() {
		return weaponMaster;
	}
	public void setWeaponMaster(boolean weaponMaster) {
		this.weaponMaster = weaponMaster;
	}
	
	
}
