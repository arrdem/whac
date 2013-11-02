package com.schlaf.steam.activities.selectlist.selected;

import java.util.ArrayList;


public class SelectedLesserWarlock extends SelectedSolo  implements WarlockInterface {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8896090832932019455L;

	public SelectedLesserWarlock(String id, String label) {
		super(id, label);
		// TODO Auto-generated constructor stub
	}

	/** warbeasts */
	ArrayList<SelectedWarbeast> attachedBeasts= new ArrayList<SelectedWarbeast>(10);

	@Override
	public ArrayList<SelectedWarbeast> getBeasts() {
		// TODO Auto-generated method stub
		return attachedBeasts;
	}
	
	@Override 
	public int getTotalCost() {
		int result = getCost();
		for (SelectedModel attached : getBeasts()) {
			result += attached.getCost();
		}
		return result;
	}	
	
	@Override
	public int getModelCount() {
		return 1 + getBeasts().size();
	}
	
	@Override
	public String getModelCountString() {
		StringBuffer sb = new StringBuffer();
		sb.append("1 lesser WL");
		if (! getBeasts().isEmpty()) {
			sb.append(" + ").append(getBeasts().size());
			sb.append(" warbeast");
			if (getBeasts().size()>1) {
				sb.append("s");
			}
		}
		return sb.toString();
	}
}
