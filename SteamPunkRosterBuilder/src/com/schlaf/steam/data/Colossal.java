package com.schlaf.steam.data;

public class Colossal extends Warjack {

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 2420923079485157927L;
	
	private String leftGrid;
	private String rightGrid;
	
	@Override
	public ModelTypeEnum getModelType() {
		return ModelTypeEnum.COLOSSAL;
	}

	public String getLeftGrid() {
		return leftGrid;
	}

	public void setLeftGrid(String leftGrid) {
		this.leftGrid = leftGrid;
	}

	public String getRightGrid() {
		return rightGrid;
	}

	public void setRightGrid(String rightGrid) {
		this.rightGrid = rightGrid;
	}
}
